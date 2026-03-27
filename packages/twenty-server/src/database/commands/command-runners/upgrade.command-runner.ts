import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  RunOnWorkspaceArgs,
  WorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { CoreMigrationRunnerService } from 'src/database/commands/core-migration-runner/services/core-migration-runner.service';
import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import {
  type CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';

export type VersionCommands = (
  | WorkspacesMigrationCommandRunner
  | ActiveOrSuspendedWorkspacesMigrationCommandRunner
)[];
export type AllCommands = Record<UpgradeCommandVersion, VersionCommands>;

export abstract class UpgradeCommandRunner extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private fromWorkspaceVersion: SemVer;
  private currentAppVersion: SemVer;
  public abstract allCommands: AllCommands;
  public commands: VersionCommands;
  public readonly VALIDATE_WORKSPACE_VERSION_FEATURE_FLAG?: true;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly coreEngineVersionService: CoreEngineVersionService,
    protected readonly workspaceVersionService: WorkspaceVersionService,
    protected readonly coreMigrationRunnerService: CoreMigrationRunnerService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  private setUpgradeContextVersionsAndCommandsForCurrentAppVersion() {
    const upgradeContextIsAlreadyDefined = [
      this.currentAppVersion,
      this.commands,
      this.fromWorkspaceVersion,
    ].every(isDefined);

    if (upgradeContextIsAlreadyDefined) {
      return;
    }

    const currentAppVersion = this.coreEngineVersionService.getCurrentVersion();
    const currentVersionMajorMinor =
      `${currentAppVersion.major}.${currentAppVersion.minor}.0` as UpgradeCommandVersion;
    const currentCommands = this.allCommands[currentVersionMajorMinor];

    if (!isDefined(currentCommands)) {
      throw new Error(
        `No command found for version ${currentAppVersion}. Please check the commands record.`,
      );
    }

    const previousVersion = this.coreEngineVersionService.getPreviousVersion();

    this.commands = currentCommands;
    this.fromWorkspaceVersion = previousVersion;
    this.currentAppVersion = currentAppVersion;

    const message = [
      'Initialized upgrade context with:',
      `- currentVersion (migrating to): ${currentAppVersion}`,
      `- fromWorkspaceVersion: ${previousVersion}`,
      `- ${this.commands.length} commands`,
    ];

    this.logger.log(chalk.blue(message.join('\n   ')));
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    try {
      this.setUpgradeContextVersionsAndCommandsForCurrentAppVersion();

      // On fresh installs there are no workspaces yet, so skip the
      // per-workspace upgrade loop (core migrations already ran above).
      const hasWorkspaces =
        await this.workspaceVersionService.hasActiveOrSuspendedWorkspaces();

      if (!hasWorkspaces) {
        this.logger.log(
          chalk.blue('Fresh installation detected, skipping migration'),
        );

        return;
      }

      const workspacesThatAreBelowFromWorkspaceVersion =
        await this.workspaceVersionService.getWorkspacesBelowVersion(
          this.fromWorkspaceVersion.version,
        );

      if (workspacesThatAreBelowFromWorkspaceVersion.length > 0) {
        this.migrationReport.fail.push(
          ...workspacesThatAreBelowFromWorkspaceVersion.map((workspace) => ({
            error: new Error(
              `Unable to run the upgrade command. Aborting the upgrade process.
Please ensure that all workspaces are on at least the previous minor version (${this.fromWorkspaceVersion.version}).
If any workspaces are not on the previous minor version, roll back to that version and run the upgrade command again.`,
            ),
            workspaceId: workspace.id,
          })),
        );
      }
    } catch (error) {
      this.migrationReport.fail.push({
        error,
        workspaceId: 'global',
      });
    }

    if (this.migrationReport.fail.length > 0) {
      this.migrationReport.fail.forEach(({ error, workspaceId }) =>
        this.logger.error(
          `Error in workspace ${workspaceId}: ${error.message}`,
        ),
      );

      return;
    }

    await this.coreMigrationRunnerService.run();
    await super.runMigrationCommand(passedParams, options);
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
        for (const command of this.commands) {
          await command.runOnWorkspace(args);
        }

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
