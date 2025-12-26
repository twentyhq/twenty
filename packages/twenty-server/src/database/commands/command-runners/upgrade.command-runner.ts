import { InjectRepository } from '@nestjs/typeorm';

import { exec } from 'child_process';
import { promisify } from 'util';

import chalk from 'chalk';
import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  RunOnWorkspaceArgs,
  WorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  type CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';
import { getPreviousVersion } from 'src/utils/version/get-previous-version';

export type VersionCommands = (
  | WorkspacesMigrationCommandRunner
  | ActiveOrSuspendedWorkspacesMigrationCommandRunner
)[];
export type AllCommands = Record<string, VersionCommands>;
const execPromise = promisify(exec);

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
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  private async loadActiveOrSuspendedWorkspace() {
    return await this.workspaceRepository.find({
      select: ['id', 'version', 'displayName'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  private async shouldSkipUpgradeIfFreshInstallation(): Promise<boolean> {
    const activeWorkspaceOrSuspendedWorkspaceCount =
      await this.loadActiveOrSuspendedWorkspace();

    return activeWorkspaceOrSuspendedWorkspaceCount.length === 0;
  }

  async runCoreMigrations(): Promise<void> {
    this.logger.log('Running global database migrations');

    try {
      this.logger.log('Running core datasource migrations...');
      const coreResult = await execPromise(
        'npx -y typeorm migration:run -d dist/database/typeorm/core/core.datasource',
      );

      this.logger.log(coreResult.stdout);

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Error running database migrations:', error);
      throw error;
    }
  }

  private async workspacesThatAreBelowFromWorkspaceVersion(
    fromWorkspaceVersion: SemVer,
  ): Promise<Pick<WorkspaceEntity, 'id' | 'displayName' | 'version'>[]> {
    try {
      const allActiveOrSuspendedWorkspaces =
        await this.loadActiveOrSuspendedWorkspace();

      if (allActiveOrSuspendedWorkspaces.length === 0) {
        this.logger.log(
          'No workspaces found. Running migrations for fresh installation.',
        );

        return [];
      }

      const workspacesThatAreBelowFromWorkspaceVersion =
        allActiveOrSuspendedWorkspaces.filter((workspace) => {
          if (!isDefined(workspace.version)) {
            return true;
          }

          try {
            const versionCompareResult = compareVersionMajorAndMinor(
              workspace.version,
              fromWorkspaceVersion.version,
            );

            return versionCompareResult === 'lower';
          } catch (error) {
            this.logger.error(
              `Error checking workspace ${workspace.id} version: ${error.message}`,
            );

            return true;
          }
        });

      return workspacesThatAreBelowFromWorkspaceVersion;
    } catch (error) {
      this.logger.error('Error checking workspaces below version:', error);

      throw error;
    }
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

      const shouldSkipUpgradeIfFreshInstallation =
        await this.shouldSkipUpgradeIfFreshInstallation();

      if (shouldSkipUpgradeIfFreshInstallation) {
        this.logger.log(
          chalk.blue('Fresh installation detected, skipping migration'),
        );

        return;
      }

      const workspacesThatAreBelowFromWorkspaceVersion =
        await this.workspacesThatAreBelowFromWorkspaceVersion(
          this.fromWorkspaceVersion,
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

    await this.runCoreMigrations();
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
