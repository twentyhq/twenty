import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { SemVer } from 'semver';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { DataSource, MigrationInterface } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { WorkspaceCommandRunner } from 'src/database/commands/command-runners/workspace.command-runner';
import { CommandLogger } from 'src/database/commands/logger';
import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

export type VersionCommands = (
  | WorkspaceCommandRunner
  | ActiveOrSuspendedWorkspaceCommandRunner
)[];

export type UpgradeCommandOptions = {
  workspaceId?: Set<string>;
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

type VersionContext = {
  fromWorkspaceVersion: SemVer;
  currentAppVersion: SemVer;
  currentVersionMajorMinor: UpgradeCommandVersion;
  instanceCommands: MigrationInterface[];
  workspaceCommands: VersionCommands;
};

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    protected readonly coreEngineVersionService: CoreEngineVersionService,
    protected readonly workspaceVersionService: WorkspaceVersionService,
    protected readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
    protected readonly instanceUpgradeService: InstanceUpgradeService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    protected readonly workspaceUpgradeService: WorkspaceUpgradeService,
    @InjectDataSource()
    protected readonly dataSource: DataSource,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Simulate the command without making actual changes',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Verbose output',
    required: false,
  })
  parseVerbose(): boolean {
    return true;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active/suspended workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(val);

    return accumulator;
  }

  @Option({
    flags: '--start-from-workspace-id [workspace_id]',
    description:
      'Start from a specific workspace id. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseStartFromWorkspaceId(val: string): string {
    return val;
  }

  @Option({
    flags: '--workspace-count-limit [count]',
    description:
      'Limit the number of workspaces to process. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseWorkspaceCountLimit(val: string): number {
    const limit = parseInt(val);

    if (isNaN(limit)) {
      throw new Error('Workspace count limit must be a number');
    }

    if (limit <= 0) {
      throw new Error('Workspace count limit must be greater than 0');
    }

    return limit;
  }

  override async run(
    _passedParams: string[],
    options: UpgradeCommandOptions,
  ): Promise<void> {
    if (options.verbose) {
      this.logger = new CommandLogger({
        verbose: true,
        constructorName: this.constructor.name,
      });
    }

    try {
      const versionContext = this.resolveVersionContext();
      this.logger.log(
        chalk.blue(
          [
            'Initialized upgrade context with:',
            `- currentVersion (migrating to): ${versionContext.currentAppVersion}`,
            `- fromWorkspaceVersion: ${versionContext.fromWorkspaceVersion}`,
            `- ${versionContext.instanceCommands.length} instance commands (from registry)`,
            `- ${versionContext.workspaceCommands.length} workspace commands`,
          ].join('\n   '),
        ),
      );

      const workspacesBelowMinimumVersion =
        await this.workspaceVersionService.getWorkspacesBelowVersion(
          versionContext.fromWorkspaceVersion.version,
        );

      if (workspacesBelowMinimumVersion.length > 0) {
        const ineligibleIds = workspacesBelowMinimumVersion
          .map((workspace) => workspace.id)
          .join(', ');

        throw new Error(
          `Unable to run the upgrade command. Aborting the upgrade process.
Workspaces below minimum version (${versionContext.fromWorkspaceVersion.version}): ${ineligibleIds}.
Please roll back to that version and run the upgrade command again.`,
        );
      }

      await this.runLegacyPendingTypeOrmMigrations();
      await this.runInstanceCommandsOrThrow(versionContext);

      const hasWorkspaces =
        await this.workspaceVersionService.hasActiveOrSuspendedWorkspaces();

      if (!hasWorkspaces) {
        this.logger.log(
          chalk.blue(
            'Fresh installation detected, skipping workspace commands',
          ),
        );

        return;
      }

      const iteratorReport = await this.runWorkspaceCommands(
        options,
        versionContext,
      );

      this.logger.log(
        chalk.blue(
          `Upgrade summary: ${iteratorReport.success.length} succeeded, ${iteratorReport.fail.length} failed`,
        ),
      );

      if (iteratorReport.fail.length > 0) {
        throw new Error(
          `Upgrade completed with ${iteratorReport.fail.length} workspace failure(s)`,
        );
      }
    } catch (error) {
      this.logger.error(chalk.red(`Upgrade failed: ${error.message}`));
      throw error;
    }
  }

  private async runLegacyPendingTypeOrmMigrations(): Promise<void> {
    this.logger.log('Running legacy TypeORM migrations...');

    const migrations = await this.dataSource.runMigrations({
      transaction: 'each',
    });

    if (migrations.length === 0) {
      this.logger.log('No pending legacy migrations');
    } else {
      this.logger.log(
        `Executed ${migrations.length} legacy migration(s): ${migrations.map((migration) => migration.name).join(', ')}`,
      );
    }
  }

  private async runInstanceCommandsOrThrow(
    versionContext: VersionContext,
  ): Promise<void> {
    for (const instanceCommand of versionContext.instanceCommands) {
      const migrationName = instanceCommand.constructor.name;
      const result =
        await this.instanceUpgradeService.runSingleMigration(instanceCommand);

      switch (result.status) {
        case 'already-executed': {
          this.logger.warn(
            `Core migration ${migrationName} already executed, skipping`,
          );

          break;
        }
        case 'failed': {
          this.logger.error(`Core migration ${migrationName} failed`);

          if (isDefined(result.error)) {
            this.logger.error(
              result.error instanceof Error
                ? (result.error.stack ?? result.error.message)
                : String(result.error),
            );
          }

          throw new Error(`Core migration ${migrationName} failed`);
        }
        case 'success': {
          this.logger.log(
            `Core migration ${migrationName} executed successfully`,
          );

          break;
        }
        default: {
          assertUnreachable(result);
        }
      }
    }
  }

  private resolveVersionContext(): VersionContext {
    const currentAppVersion = this.coreEngineVersionService.getCurrentVersion();
    const currentVersionMajorMinor =
      `${currentAppVersion.major}.${currentAppVersion.minor}.0` as UpgradeCommandVersion;

    const workspaceCommands =
      this.upgradeCommandRegistryService.getWorkspaceCommandsForVersion(
        currentVersionMajorMinor,
      );

    const fromWorkspaceVersion =
      this.coreEngineVersionService.getPreviousVersion();

    const instanceCommands =
      this.upgradeCommandRegistryService.getInstanceCommandsForVersion(
        currentVersionMajorMinor,
      );

    return {
      fromWorkspaceVersion,
      currentAppVersion,
      currentVersionMajorMinor,
      workspaceCommands,
      instanceCommands,
    };
  }

  private async runWorkspaceCommands(
    options: UpgradeCommandOptions,
    versionContext: VersionContext,
  ) {
    return await this.workspaceIteratorService.iterate({
      workspaceIds:
        options.workspaceId && options.workspaceId.size > 0
          ? Array.from(options.workspaceId)
          : undefined,
      startFromWorkspaceId: options.startFromWorkspaceId,
      workspaceCountLimit: options.workspaceCountLimit,
      dryRun: options.dryRun,
      callback: async (context) => {
        await this.workspaceUpgradeService.upgradeWorkspace({
          iteratorContext: context,
          options,
          fromWorkspaceVersion: versionContext.fromWorkspaceVersion,
          currentAppVersion: versionContext.currentAppVersion,
          workspaceCommands: versionContext.workspaceCommands,
        });
      },
    });
  }
}
