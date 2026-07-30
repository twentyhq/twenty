import { Injectable, Logger } from '@nestjs/common';

import { UpgradeHealthEnum } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PROVISIONED_WORKSPACE_ACTIVATION_STATUSES } from 'twenty-shared/workspace';

import { InjectRepository } from '@nestjs/typeorm';
import { TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-cross-upgrade-supported-version.constant';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { advanceThroughVersionsWithoutInstanceCommands } from 'src/engine/core-modules/upgrade/utils/advance-through-versions-without-instance-commands.util';
import { extractVersionFromCommandNameOrThrow } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name-or-throw.util';
import {
  resolveCompletedVersionFromCursor,
  type UpgradeCursor,
} from 'src/engine/core-modules/upgrade/utils/resolve-completed-version-from-cursor.util';

import { activationStatusIn } from 'src/database/commands/command-runners/utils/activation-status-in.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { In, Repository } from 'typeorm';

export type LatestUpgradeCommand = UpgradeCursor & {
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

export type InstanceAndWorkspaceCountsUpgradeStatus = {
  instanceUpgradeStatus: InstanceUpgradeStatus;
  behindWorkspaceCount: number;
  failedWorkspaceCount: number;
  upToDateWorkspaceCount: number;
  computedAt: Date;
};

type CachedInstanceAndWorkspaceUpgradeStatus = {
  instanceUpgradeStatus: InstanceUpgradeStatus;
  behindWorkspaceIds: string[];
  failedWorkspaceIds: string[];
  upToDateWorkspaceCount: number;
  computedAt: Date;
};

const deriveHealth = (
  cursor: UpgradeCursor,
  lastExpectedCommandName: string | null,
): UpgradeHealthEnum => {
  if (cursor.status === 'failed') {
    return UpgradeHealthEnum.FAILED;
  }

  if (
    lastExpectedCommandName !== null &&
    cursor.name !== lastExpectedCommandName
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
  ) {}

  async getInstanceStatus(): Promise<InstanceUpgradeStatus> {
    const cursor =
      await this.upgradeMigrationService.getLastAttemptedInstanceCommand();

    const stepNames = this.upgradeSequenceReaderService.getUpgradeStepNames({
      'fast-instance': true,
      'slow-instance': true,
    });
    const lastExpectedCommandName = stepNames[stepNames.length - 1] ?? null;

    return {
      ...this.buildCursorStatus(cursor, lastExpectedCommandName),
      inferredVersion: this.resolveInstanceCompletedVersion(cursor),
    };
  }

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

    const stepNames = this.upgradeSequenceReaderService.getUpgradeStepNames();
    const lastExpectedCommandName = stepNames[stepNames.length - 1] ?? null;

    return workspaces.map((workspace) => ({
      ...this.buildCursorStatus(
        cursors.get(workspace.id) ?? null,
        lastExpectedCommandName,
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

    return resolveCompletedVersionFromCursor({
      stepNames: this.upgradeSequenceReaderService.getUpgradeStepNames(),
      cursor,
    });
  }

  async getInstanceAndWorkspaceCountsStatus(): Promise<InstanceAndWorkspaceCountsUpgradeStatus> {
    const cachedStatus = await this.getCachedInstanceAndWorkspaceStatus();

    if (!isDefined(cachedStatus)) {
      const refreshedStatus =
        await this.refreshInstanceAndAllWorkspacesStatus();

      return {
        instanceUpgradeStatus: refreshedStatus.instanceUpgradeStatus,
        behindWorkspaceCount: refreshedStatus.workspacesBehind.length,
        failedWorkspaceCount: refreshedStatus.workspacesFailed.length,
        upToDateWorkspaceCount: refreshedStatus.upToDateWorkspaceCount,
        computedAt: refreshedStatus.computedAt,
      };
    }

    return {
      instanceUpgradeStatus: cachedStatus.instanceUpgradeStatus,
      behindWorkspaceCount: cachedStatus.behindWorkspaceIds.length,
      failedWorkspaceCount: cachedStatus.failedWorkspaceIds.length,
      upToDateWorkspaceCount: cachedStatus.upToDateWorkspaceCount,
      computedAt: cachedStatus.computedAt,
    };
  }

  async getInstanceAndAllWorkspacesStatus(): Promise<InstanceAndAllWorkspacesUpgradeStatus> {
    const cachedStatus = await this.getCachedInstanceAndWorkspaceStatus();

    if (!isDefined(cachedStatus)) {
      return this.refreshInstanceAndAllWorkspacesStatus();
    }

    const workspaceNamesById = await this.loadWorkspaceNamesById([
      ...cachedStatus.behindWorkspaceIds,
      ...cachedStatus.failedWorkspaceIds,
    ]);

    return {
      instanceUpgradeStatus: cachedStatus.instanceUpgradeStatus,
      workspacesBehind: this.toWorkspaceRefs(
        cachedStatus.behindWorkspaceIds,
        workspaceNamesById,
      ),
      workspacesFailed: this.toWorkspaceRefs(
        cachedStatus.failedWorkspaceIds,
        workspaceNamesById,
      ),
      upToDateWorkspaceCount: cachedStatus.upToDateWorkspaceCount,
      computedAt: cachedStatus.computedAt,
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

  private async getCachedInstanceAndWorkspaceStatus(): Promise<CachedInstanceAndWorkspaceUpgradeStatus | null> {
    const computedAt = await this.upgradeStatusCacheService.getComputedAt();

    if (!isDefined(computedAt)) {
      return null;
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

    return {
      instanceUpgradeStatus,
      behindWorkspaceIds,
      failedWorkspaceIds,
      upToDateWorkspaceCount,
      computedAt,
    };
  }

  private resolveInstanceCompletedVersion(
    cursor: UpgradeCursor | null,
  ): string | null {
    if (!isDefined(cursor)) {
      return null;
    }

    const stepNames = this.upgradeSequenceReaderService.getUpgradeStepNames({
      'fast-instance': true,
      'slow-instance': true,
    });

    const completedVersion = resolveCompletedVersionFromCursor({
      stepNames,
      cursor,
    });

    if (!isDefined(completedVersion)) {
      return null;
    }

    return advanceThroughVersionsWithoutInstanceCommands({
      completedVersion,
      supportedVersions: TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS,
      versionsWithInstanceCommands: new Set(
        stepNames.map(extractVersionFromCommandNameOrThrow),
      ),
    });
  }

  private buildCursorStatus(
    cursor: LatestUpgradeCommand | null,
    lastExpectedCommandName: string | null,
  ): InstanceUpgradeStatus {
    if (!isDefined(cursor)) {
      return {
        inferredVersion: null,
        health: UpgradeHealthEnum.BEHIND,
        latestCommand: null,
      };
    }

    return {
      inferredVersion: extractVersionFromCommandNameOrThrow(cursor.name),
      health: deriveHealth(cursor, lastExpectedCommandName),
      latestCommand: {
        name: cursor.name,
        status: cursor.status,
        executedByVersion: cursor.executedByVersion,
        errorMessage: cursor.errorMessage,
        createdAt: cursor.createdAt,
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

    const workspaces = await this.workspaceRepository.find({
      select: ['id', 'displayName'],
      where: {
        id: In(workspaceIds),
      },
    });

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
