import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { extractVersionFromCommandName } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type UpgradeHealth = 'up-to-date' | 'behind' | 'failed';

export type MigrationCursorStatus = {
  inferredVersion: string | null;
  health: UpgradeHealth;
  latestCommand: {
    name: string;
    status: UpgradeMigrationStatus;
    executedByVersion: string;
    errorMessage: string | null;
    createdAt: Date;
  } | null;
};

export type WorkspaceStatus = MigrationCursorStatus & {
  workspaceId: string;
  displayName: string | null;
};

const deriveHealth = (
  migration: { name: string; status: UpgradeMigrationStatus },
  lastExpectedCommandName: string | null,
): UpgradeHealth => {
  if (migration.status === 'failed') {
    return 'failed';
  }

  if (
    lastExpectedCommandName !== null &&
    migration.name !== lastExpectedCommandName
  ) {
    return 'behind';
  }

  return 'up-to-date';
};

@Injectable()
export class UpgradeStatusService {
  private readonly logger = new Logger(UpgradeStatusService.name);

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getInstanceStatus(): Promise<MigrationCursorStatus> {
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
  ): Promise<WorkspaceStatus[]> {
    const workspaces = await this.loadWorkspaces(filterWorkspaceIds);

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

  private buildCursorStatus(
    migration: {
      name: string;
      status: UpgradeMigrationStatus;
      executedByVersion: string;
      errorMessage: string | null;
      createdAt: Date;
    } | null,
    lastExpectedCommandName: string | null,
  ): MigrationCursorStatus {
    if (!migration) {
      return { inferredVersion: null, health: 'behind', latestCommand: null };
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

  private async loadWorkspaces(
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
}
