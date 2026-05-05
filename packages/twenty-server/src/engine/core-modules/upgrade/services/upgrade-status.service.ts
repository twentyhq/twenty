import { Injectable, Logger } from '@nestjs/common';

import { UpgradeHealthEnum } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { InjectRepository } from '@nestjs/typeorm';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { extractVersionFromCommandName } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { In, Repository } from 'typeorm';

export type LatestUpgradeCommand = {
  name: string;
  status: UpgradeMigrationStatus;
  executedByVersion: string;
  errorMessage: string | null;
  createdAt: Date;
};

export type InstanceUpgradeStatus = {
  inferredVersion: string | null;
  health: UpgradeHealthEnum;
  latestCommand: LatestUpgradeCommand | null;
};

export type WorkspaceUpgradeStatus = {
  workspaceId: string;
  displayName: string | null;
  inferredVersion: string | null;
  health: UpgradeHealthEnum;
  latestCommand: LatestUpgradeCommand | null;
};

export type WorkspaceUpgradeRef = {
  id: string;
  name: string | null;
};

export type InstanceAndAllWorkspacesUpgradeStatus = {
  instanceUpgradeStatus: InstanceUpgradeStatus;
  workspacesBehind: WorkspaceUpgradeRef[];
  workspacesFailed: WorkspaceUpgradeRef[];
  computedAt: Date;
};

const deriveHealth = (
  migration: { name: string; status: UpgradeMigrationStatus },
  lastExpectedCommandName: string | null,
): UpgradeHealthEnum => {
  if (migration.status === 'failed') {
    return UpgradeHealthEnum.FAILED;
  }

  if (
    lastExpectedCommandName !== null &&
    migration.name !== lastExpectedCommandName
  ) {
    return UpgradeHealthEnum.BEHIND;
  }

  return UpgradeHealthEnum.UP_TO_DATE;
};

@Injectable()
export class UpgradeStatusService {
  private readonly logger = new Logger(UpgradeStatusService.name);

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly upgradeStatusCacheService: UpgradeStatusCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async getInstanceStatus(): Promise<InstanceUpgradeStatus> {
    const migration =
      await this.upgradeMigrationService.getLastAttemptedInstanceCommand();

    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();
    const lastInstanceStep = [...sequence]
      .reverse()
      .find(
        (step) =>
          step.kind === 'fast-instance' || step.kind === 'slow-instance',
      );

    return this.buildCursorStatus(migration, lastInstanceStep?.name ?? null);
  }

  async getWorkspaceStatuses(
    filterWorkspaceIds?: string[],
  ): Promise<WorkspaceUpgradeStatus[]> {
    const workspaces =
      await this.loadActiveOrSuspendedWorkspaces(filterWorkspaceIds);

    if (filterWorkspaceIds) {
      const foundIds = new Set(workspaces.map((workspace) => workspace.id));

      for (const requestedId of filterWorkspaceIds) {
        if (!foundIds.has(requestedId)) {
          this.logger.warn(
            `Workspace ${requestedId} not found or not active/suspended`,
          );
        }
      }
    }

    const loadedWorkspaceIds = workspaces.map((workspace) => workspace.id);
    const cursors =
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandName(
        loadedWorkspaceIds,
      );

    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();
    const lastStepName =
      sequence.length > 0 ? sequence[sequence.length - 1].name : null;

    return workspaces.map((workspace) => ({
      ...this.buildCursorStatus(
        cursors.get(workspace.id) ?? null,
        lastStepName,
      ),
      workspaceId: workspace.id,
      displayName: workspace.displayName ?? null,
    }));
  }

  async getInstanceAndAllWorkspacesStatus(): Promise<InstanceAndAllWorkspacesUpgradeStatus> {
    const computedAt = await this.upgradeStatusCacheService.getComputedAt();

    if (!isDefined(computedAt)) {
      return this.refreshInstanceAndAllWorkspacesStatus();
    }

    const [instanceUpgradeStatus, behindWorkspaceIds, failedWorkspaceIds] =
      await Promise.all([
        this.getInstanceStatus(),
        this.upgradeStatusCacheService.getBehindWorkspaceIds(),
        this.upgradeStatusCacheService.getFailedWorkspaceIds(),
      ]);

    const workspaceNamesById = await this.loadWorkspaceNamesById([
      ...behindWorkspaceIds,
      ...failedWorkspaceIds,
    ]);

    return {
      instanceUpgradeStatus,
      workspacesBehind: this.toWorkspaceRefs(
        behindWorkspaceIds,
        workspaceNamesById,
      ),
      workspacesFailed: this.toWorkspaceRefs(
        failedWorkspaceIds,
        workspaceNamesById,
      ),
      computedAt,
    };
  }

  async refreshInstanceAndAllWorkspacesStatus(): Promise<InstanceAndAllWorkspacesUpgradeStatus> {
    this.logger.log('Recomputing upgrade status for all workspaces');

    const [instanceUpgradeStatus, workspaceStatuses] = await Promise.all([
      this.getInstanceStatus(),
      this.getWorkspaceStatuses(),
    ]);

    const workspacesBehind: WorkspaceUpgradeRef[] = [];
    const workspacesFailed: WorkspaceUpgradeRef[] = [];

    for (const workspaceStatus of workspaceStatuses) {
      const workspaceRef: WorkspaceUpgradeRef = {
        id: workspaceStatus.workspaceId,
        name: workspaceStatus.displayName,
      };

      if (workspaceStatus.health === UpgradeHealthEnum.BEHIND) {
        workspacesBehind.push(workspaceRef);
      } else if (workspaceStatus.health === UpgradeHealthEnum.FAILED) {
        workspacesFailed.push(workspaceRef);
      }
    }

    const computedAt = new Date();

    await this.upgradeStatusCacheService.write({
      behindWorkspaceIds: workspacesBehind.map((workspace) => workspace.id),
      failedWorkspaceIds: workspacesFailed.map((workspace) => workspace.id),
      computedAt,
    });

    return {
      instanceUpgradeStatus,
      workspacesBehind,
      workspacesFailed,
      computedAt,
    };
  }

  async invalidateInstanceAndAllWorkspacesStatus(): Promise<void> {
    await this.upgradeStatusCacheService.invalidate();
  }

  private buildCursorStatus(
    migration: LatestUpgradeCommand | null,
    lastExpectedCommandName: string | null,
  ): InstanceUpgradeStatus {
    if (!migration) {
      return {
        inferredVersion: null,
        health: UpgradeHealthEnum.BEHIND,
        latestCommand: null,
      };
    }

    const health = deriveHealth(migration, lastExpectedCommandName);

    return {
      inferredVersion: extractVersionFromCommandName(migration.name),
      health,
      latestCommand: {
        name: migration.name,
        status: migration.status,
        executedByVersion: migration.executedByVersion,
        errorMessage: migration.errorMessage,
        createdAt: migration.createdAt,
      },
    };
  }

  private async loadActiveOrSuspendedWorkspaces(
    workspaceIds?: string[],
  ): Promise<Pick<WorkspaceEntity, 'id' | 'displayName'>[]> {
    return this.workspaceRepository.find({
      select: ['id', 'displayName'],
      where: {
        ...(workspaceIds && workspaceIds.length > 0
          ? { id: In(workspaceIds) }
          : {}),
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
      },
      order: { id: 'ASC' },
    });
  }

  private async loadWorkspaceNamesById(
    workspaceIds: string[],
  ): Promise<Map<string, string | null>> {
    const namesById = new Map<string, string | null>();

    if (workspaceIds.length === 0) {
      return namesById;
    }

    const workspaces = await Promise.all(
      workspaceIds.map((workspaceId) =>
        this.coreEntityCacheService.get('workspaceEntity', workspaceId),
      ),
    );

    for (const workspace of workspaces) {
      if (isDefined(workspace)) {
        namesById.set(workspace.id, workspace.displayName ?? null);
      }
    }

    return namesById;
  }

  private toWorkspaceRefs(
    workspaceIds: string[],
    workspaceNamesById: Map<string, string | null>,
  ): WorkspaceUpgradeRef[] {
    return workspaceIds.map((workspaceId) => ({
      id: workspaceId,
      name: workspaceNamesById.get(workspaceId) ?? null,
    }));
  }
}
