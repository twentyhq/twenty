import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import {
  CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';
import { getPreviousVersion } from 'src/utils/version/get-previous-version';

export type VersionCommands = {
  beforeSyncMetadata: ActiveOrSuspendedWorkspacesMigrationCommandRunner[];
  afterSyncMetadata: ActiveOrSuspendedWorkspacesMigrationCommandRunner[];
};
export type AllCommands = Record<string, VersionCommands>;
export abstract class UpgradeCommandRunner extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private fromWorkspaceVersion: SemVer;
  private currentAppVersion: SemVer;
  public abstract allCommands: AllCommands;
  public commands: VersionCommands;
  public readonly VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG?: true;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  private setUpgradeContextVersionsAndCommandsForCurrentAppVersion() {
    const ugpradeContextIsAlreadyDefined = [
      this.currentAppVersion,
      this.commands,
      this.fromWorkspaceVersion,
    ].every(isDefined);

    if (ugpradeContextIsAlreadyDefined) {
      return;
    }

    const currentAppVersion = this.retrieveCurrentAppVersion();
    const currentVersionMajorMinor = `${currentAppVersion.major}.${currentAppVersion.minor}.0`;
    const currentCommands = this.allCommands[currentVersionMajorMinor];

    if (!isDefined(currentCommands)) {
      throw new Error(
        `No command found for version ${currentAppVersion}. Please check the commands record.`,
      );
    }

    const allCommandsVersions = Object.keys(this.allCommands);
    const previousVersion = getPreviousVersion({
      currentVersion: currentVersionMajorMinor,
      versions: allCommandsVersions,
    });

    if (!isDefined(previousVersion)) {
      throw new Error(
        `No previous version found for version ${currentAppVersion}. Please review the "allCommands" record. Available versions are: ${allCommandsVersions.join(', ')}`,
      );
    }
    this.commands = currentCommands;
    this.fromWorkspaceVersion = previousVersion;
    this.currentAppVersion = currentAppVersion;

    const message = [
      'Initialized upgrade context with:',
      `- currentVersion (migrating to): ${currentAppVersion}`,
      `- fromWorkspaceVersion: ${previousVersion}`,
      `- ${this.commands.beforeSyncMetadata.length + this.commands.afterSyncMetadata.length} commands`,
    ];

    this.logger.log(chalk.blue(message.join('\n   ')));
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    this.setUpgradeContextVersionsAndCommandsForCurrentAppVersion();

    const { workspaceId, index, total, options } = args;

    this.logger.log(
      chalk.blue(
        `${options.dryRun ? '(dry run) ' : ''}Upgrading workspace ${workspaceId} from=${this.fromWorkspaceVersion} to=${this.currentAppVersion} ${index + 1}/${total}`,
      ),
    );

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

        if (!options.dryRun) {
          await this.workspaceRepository.update(
            { id: workspaceId },
            { version: this.currentAppVersion.version },
          );
        }

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

  public readonly runBeforeSyncMetadata = async (args: RunOnWorkspaceArgs) => {
    for (const command of this.commands.beforeSyncMetadata) {
      await command.runOnWorkspace(args);
    }
  };

  public readonly runAfterSyncMetadata = async (args: RunOnWorkspaceArgs) => {
    for (const command of this.commands.afterSyncMetadata) {
      await command.runOnWorkspace(args);
    }
  };

  private retrieveCurrentAppVersion() {
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    if (!isDefined(appVersion)) {
      throw new Error(
        'Cannot run upgrade command when APP_VERSION is not defined, please double check your env variables',
      );
    }

    try {
      return new SemVer(appVersion);
    } catch {
      throw new Error(
        `Should never occur, APP_VERSION is invalid ${appVersion}`,
      );
    }
  }

  private async retrieveWorkspaceVersionAndCompareToWorkspaceFromVersion(
    workspaceId: string,
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
      this.fromWorkspaceVersion.version,
    );
  }
}
