import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SemVer } from 'semver';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspaceIteratorContext } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type UpgradeCommandOptions,
  type VersionCommands,
} from 'src/database/commands/upgrade-version-command/upgrade.command';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  type CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';

export type UpgradeWorkspaceArgs = {
  iteratorContext: WorkspaceIteratorContext;
  options: UpgradeCommandOptions;
  fromWorkspaceVersion: SemVer;
  currentAppVersion: SemVer;
  workspaceCommands: VersionCommands;
};

@Injectable()
export class WorkspaceUpgradeService {
  private readonly logger = new Logger(WorkspaceUpgradeService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  async upgradeWorkspace({
    iteratorContext,
    options,
    fromWorkspaceVersion,
    currentAppVersion,
    workspaceCommands,
  }: UpgradeWorkspaceArgs): Promise<void> {
    const { workspaceId, index, total } = iteratorContext;

    this.logger.log(
      `${options.dryRun ? '(dry run) ' : ''}Upgrading workspace ${workspaceId} from=${fromWorkspaceVersion} to=${currentAppVersion} ${index + 1}/${total}`,
    );

    const versionCompareResult =
      await this.compareWorkspaceVersionToFromVersion(
        workspaceId,
        fromWorkspaceVersion,
      );

    switch (versionCompareResult) {
      case 'lower': {
        throw new Error(
          `WORKSPACE_VERSION_MISMATCH Upgrade for workspace ${workspaceId} failed as its version is beneath fromWorkspaceVersion=${fromWorkspaceVersion.version}`,
        );
      }
      case 'equal': {
        const executedByVersion =
          this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

        for (const workspaceCommand of workspaceCommands) {
          await this.runSingleWorkspaceCommandOrThrow({
            workspaceCommand,
            workspaceId,
            executedByVersion,
            options,
            iteratorContext,
          });
        }

        if (!options.dryRun) {
          await this.workspaceRepository.update(
            { id: workspaceId },
            { version: currentAppVersion.version },
          );
        }

        this.logger.log(`Upgrade for workspace ${workspaceId} completed.`);

        return;
      }
      case 'higher': {
        this.logger.log(
          `Upgrade for workspace ${workspaceId} ignored as is already at a higher version.`,
        );

        return;
      }
      default: {
        assertUnreachable(versionCompareResult);
      }
    }
  }

  private async compareWorkspaceVersionToFromVersion(
    workspaceId: string,
    fromWorkspaceVersion: SemVer,
  ): Promise<CompareVersionMajorAndMinorReturnType> {
    const workspace = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });
    const currentWorkspaceVersion = workspace.version;

    if (!isDefined(currentWorkspaceVersion)) {
      throw new Error(`WORKSPACE_VERSION_NOT_DEFINED workspace=${workspaceId}`);
    }

    return compareVersionMajorAndMinor(
      currentWorkspaceVersion,
      fromWorkspaceVersion.version,
    );
  }

  private async runSingleWorkspaceCommandOrThrow({
    workspaceCommand,
    workspaceId,
    executedByVersion,
    options,
    iteratorContext,
  }: {
    workspaceCommand: VersionCommands[number];
    workspaceId: string;
    executedByVersion: string;
    options: UpgradeCommandOptions;
    iteratorContext: WorkspaceIteratorContext;
  }): Promise<void> {
    const commandName = workspaceCommand.constructor.name;

    const isAlreadyCompleted =
      await this.upgradeMigrationService.isLastAttemptCompleted({
        name: commandName,
        workspaceId,
      });

    if (isAlreadyCompleted) {
      this.logger.log(
        `Workspace command ${commandName} already completed for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    try {
      await workspaceCommand.runOnWorkspace({
        options,
        workspaceId,
        dataSource: iteratorContext.dataSource,
        index: iteratorContext.index,
        total: iteratorContext.total,
      });

      if (!options.dryRun) {
        await this.upgradeMigrationService.markAsCompleted({
          name: commandName,
          workspaceId,
          executedByVersion,
        });
      }
    } catch (error) {
      if (!options.dryRun) {
        await this.upgradeMigrationService.markAsFailed({
          name: commandName,
          workspaceId,
          executedByVersion,
        });
      }

      throw error;
    }
  }
}
