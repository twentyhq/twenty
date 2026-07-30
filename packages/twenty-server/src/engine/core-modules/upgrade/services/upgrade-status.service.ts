import { Injectable, Logger } from '@nestjs/common';

import { UpgradeHealthEnum } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PROVISIONED_WORKSPACE_ACTIVATION_STATUSES } from 'twenty-shared/workspace';

import { InjectRepository } from '@nestjs/typeorm';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-cross-upgrade-supported-version.constant';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { advanceThroughVersionsWithoutInstanceCommands } from 'src/engine/core-modules/upgrade/utils/advance-through-versions-without-instance-commands.util';
import { extractVersionFromCommandName } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name.util';
import { resolveCompletedVersionFromCursor } from 'src/engine/core-modules/upgrade/utils/resolve-completed-version-from-cursor.util';

import { activationStatusIn } from 'src/database/commands/command-runners/utils/activation-status-in.util';
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
  upToDateWorkspaceCount: number;
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

    if (!isDefined(migration)) {
      return {
        inferredVersion: null,
        health: UpgradeHealthEnum.BEHIND,
        latestCommand: null,
      };
    }

    const instanceStepNames = this.getInstanceStepNames();

    return {
      inferredVersion: this.resolveInstanceCompletedVersion(migration),
      health: deriveHealth(
        migration,
        instanceStepNames[instanceStepNames.length - 1] ?? null,
      ),
      latestCommand: {
        name: migration.name,
        status: migration.status,
        executedByVersion: migration.executedByVersion,
        errorMessage: migration.errorMessage,
        createdAt: migration.createdAt,
      },
    };
  }

  // The version the instance itself has reached, independently of any
  // workspace. Used to decide whether this server can host an app declaring an
  // `engines.twenty` range.
  async getInstanceCompletedVersion(): Promise<string | null> {
    const cursor =
      await this.upgradeMigrationService.getLastAttemptedInstanceCommand();

    return this.resolveInstanceCompletedVersion(cursor);
  }

  async getWorkspaceStatuses(
    filterWorkspaceIds?: string[],
  ): Promise<WorkspaceUpgradeStatus[]> {
    const workspaces = await this.loadProvisionedWorkspaces(filterWorkspaceIds);

    if (filterWorkspaceIds) {
      const foundIds = new Set(workspaces.map((workspace) => workspace.id));

      for (const requestedId of filterWorkspaceIds) {
        if (!foundIds.has(requestedId)) {
          this.logger.warn(
            `Workspace ${requestedId} not found or not provisioned`,
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

  async getWorkspaceCompletedVersion(
    workspaceId: string,
  ): Promise<string | null> {
    const cursors =
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandName([
        workspaceId,
      ]);
    const cursor = cursors.get(workspaceId);

    if (!isDefined(cursor)) {
      return null;
    }

    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

    return resolveCompletedVersionFromCursor({
      sequenceStepNames: sequence.map((step) => step.name),
      cursorName: cursor.name,
      cursorStatus: cursor.status,
    });
  }

  async getInstanceAndAllWorkspacesStatus(): Promise<InstanceAndAllWorkspacesUpgradeStatus> {
    const computedAt = await this.upgradeStatusCacheService.getComputedAt();

    if (!isDefined(computedAt)) {
      return this.refreshInstanceAndAllWorkspacesStatus();
    }

    const [
      instanceUpgradeStatus,
      behindWorkspaceIds,
      failedWorkspaceIds,
      upToDateWorkspaceCount,
    ] = await Promise.all([
      this.getInstanceStatus(),
      this.upgradeStatusCacheService.getBehindWorkspaceIds(),
      this.upgradeStatusCacheService.getFailedWorkspaceIds(),
      this.upgradeStatusCacheService.getUpToDateWorkspaceCount(),
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
      upToDateWorkspaceCount,
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
    let upToDateWorkspaceCount = 0;

    for (const workspaceStatus of workspaceStatuses) {
      const workspaceRef: WorkspaceUpgradeRef = {
        id: workspaceStatus.workspaceId,
        name: workspaceStatus.displayName,
      };

      if (workspaceStatus.health === UpgradeHealthEnum.BEHIND) {
        workspacesBehind.push(workspaceRef);
      } else if (workspaceStatus.health === UpgradeHealthEnum.FAILED) {
        workspacesFailed.push(workspaceRef);
      } else if (workspaceStatus.health === UpgradeHealthEnum.UP_TO_DATE) {
        upToDateWorkspaceCount++;
      }
    }

    const computedAt = new Date();

    await this.upgradeStatusCacheService.write({
      behindWorkspaceIds: workspacesBehind.map((workspace) => workspace.id),
      failedWorkspaceIds: workspacesFailed.map((workspace) => workspace.id),
      upToDateWorkspaceCount,
      computedAt,
    });

    return {
      instanceUpgradeStatus,
      workspacesBehind,
      workspacesFailed,
      upToDateWorkspaceCount,
      computedAt,
    };
  }

  async invalidateInstanceAndAllWorkspacesStatus(): Promise<void> {
    await this.upgradeStatusCacheService.invalidate();
  }

  private getInstanceStepNames(): string[] {
    return this.upgradeSequenceReaderService
      .getUpgradeSequence()
      .filter(
        (step) =>
          step.kind === 'fast-instance' || step.kind === 'slow-instance',
      )
      .map((step) => step.name);
  }

  private resolveInstanceCompletedVersion(
    cursor: { name: string; status: UpgradeMigrationStatus } | null,
  ): string | null {
    if (!isDefined(cursor)) {
      return null;
    }

    const instanceStepNames = this.getInstanceStepNames();

    const completedVersion = resolveCompletedVersionFromCursor({
      sequenceStepNames: instanceStepNames,
      cursorName: cursor.name,
      cursorStatus: cursor.status,
    });

    if (!isDefined(completedVersion)) {
      return null;
    }

    return advanceThroughVersionsWithoutInstanceCommands({
      completedVersion,
      supportedVersions: TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS,
      versionsWithInstanceCommands: new Set(
        instanceStepNames
          .map((name) => extractVersionFromCommandName(name))
          .filter(isDefined),
      ),
    });
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

  private async loadProvisionedWorkspaces(
    workspaceIds?: string[],
  ): Promise<Pick<WorkspaceEntity, 'id' | 'displayName'>[]> {
    return this.workspaceRepository.find({
      select: ['id', 'displayName'],
      where: {
        ...(workspaceIds && workspaceIds.length > 0
          ? { id: In(workspaceIds) }
          : {}),
        activationStatus: activationStatusIn(
          PROVISIONED_WORKSPACE_ACTIVATION_STATUSES,
        ),
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
