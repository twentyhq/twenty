import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import {
  CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

export abstract class UpgradeCommandRunner extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  abstract readonly fromWorkspaceVersion: SemVer;
  public readonly VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG?: true;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly environmentService: EnvironmentService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceId, index, total, options } = args;

    this.logger.log(
      chalk.blue(
        `${options.dryRun ? '(dry run)' : ''} Upgrading workspace ${workspaceId} ${index + 1}/${total}`,
      ),
    );
    const toVersion = this.retrieveToVersionFromAppVersion();

    const workspaceVersionCompareResult =
      await this.retrieveWorkspaceVersionAndCompareToWorkspaceFromVersion(
        workspaceId,
      );

    switch (workspaceVersionCompareResult) {
      case 'lower': {
        throw new Error(
          `WORKSPACE_VERSION_MISSMATCH Upgrade for workspace ${workspaceId} failed as its version is beneath fromWorkspaceVersion=${this.fromWorkspaceVersion.version}`,
        );
      }
      case 'equal': {
        await this.runBeforeSyncMetadata(args);
        await this.syncWorkspaceMetadataCommand.runOnWorkspace(args);
        await this.runAfterSyncMetadata(args);

        await this.workspaceRepository.update(
          { id: workspaceId },
          { version: toVersion },
        );
        this.logger.log(
          chalk.blue(`Upgrade for workspace ${workspaceId} completed.`),
        );

        return;
      }
      case 'higher': {
        this.logger.log(
          chalk.blue(
            `Upgrade for workspace ${workspaceId} ignored as is already at a higher version.`,
          ),
        );

        return;
      }
      default: {
        throw new Error(
          `Should never occur, encountered unexpected value from retrieveWorkspaceVersionAndCompareToWorkspaceFromVersion ${workspaceVersionCompareResult}`,
        );
      }
    }
  }

  private retrieveToVersionFromAppVersion() {
    const appVersion = this.environmentService.get('APP_VERSION');

    if (!isDefined(appVersion)) {
      throw new Error(
        'Cannot run upgrade command when APP_VERSION is not defined, please double check your env variables',
      );
    }

    const parsedVersion = extractVersionMajorMinorPatch(appVersion);

    if (!isDefined(parsedVersion)) {
      throw new Error(
        `Should never occur, APP_VERSION is invalid ${parsedVersion}`,
      );
    }

    return parsedVersion;
  }

  private async retrieveWorkspaceVersionAndCompareToWorkspaceFromVersion(
    workspaceId: string,
  ): Promise<CompareVersionMajorAndMinorReturnType> {
    // TODO remove after first release has been done using workspace_version
    if (!isDefined(this.VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG)) {
      this.logger.warn(
        'VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG set to true ignoring workspace versions validation step',
      );

      return 'equal';
    }

    const workspace = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });
    const currentWorkspaceVersion = workspace.version;

    if (!isDefined(currentWorkspaceVersion)) {
      throw new Error(`WORKSPACE_VERSION_NOT_DEFINED workspace=${workspaceId}`);
    }

    return compareVersionMajorAndMinor(
      currentWorkspaceVersion,
      this.fromWorkspaceVersion.version,
    );
  }

  protected abstract runBeforeSyncMetadata(
    args: RunOnWorkspaceArgs,
  ): Promise<void>;
  protected abstract runAfterSyncMetadata(
    args: RunOnWorkspaceArgs,
  ): Promise<void>;
}
