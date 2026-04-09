import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { SemVer } from 'semver';
import { DataSource } from 'typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CommandLogger } from 'src/database/commands/logger';
import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import {
  UpgradeCommandRegistryService,
  type RegisteredWorkspaceCommand,
  type VersionBundle,
} from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

export type VersionCommands = RegisteredWorkspaceCommand[];

export type UpgradeCommandOptions = {
  workspaceId?: Set<string>;
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

type VersionContext = VersionBundle & {
  fromWorkspaceVersion: SemVer;
  currentAppVersion: SemVer;
  currentVersionMajorMinor: UpgradeCommandVersion;
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
            `- ${versionContext.fastInstanceCommands.length} fast instance commands (from registry)`,
            `- ${versionContext.slowInstanceCommands.length} slow instance commands (from registry)`,
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

      for (const { command, name } of versionContext.fastInstanceCommands) {
        const result = await this.instanceUpgradeService.runFastInstanceCommand(
          {
            command,
            name,
          },
        );

        if (result.status === 'failed') {
          throw result.error;
        }
      }

      const hasWorkspaces =
        await this.workspaceVersionService.hasActiveOrSuspendedWorkspaces();

      for (const { command, name } of versionContext.slowInstanceCommands) {
        const result = await this.instanceUpgradeService.runSlowInstanceCommand(
          {
            command,
            name,
            skipDataMigration: !hasWorkspaces,
          },
        );

        if (result.status === 'failed') {
          throw result.error;
        }
      }

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

  private resolveVersionContext(): VersionContext {
    const currentAppVersion = this.coreEngineVersionService.getCurrentVersion();
    const currentVersionMajorMinor =
      `${currentAppVersion.major}.${currentAppVersion.minor}.0` as UpgradeCommandVersion;

    const fromWorkspaceVersion =
      this.coreEngineVersionService.getPreviousVersion();

    const { fastInstanceCommands, slowInstanceCommands, workspaceCommands } =
      this.upgradeCommandRegistryService.getBundleForVersion(
        currentVersionMajorMinor,
      );

    return {
      fromWorkspaceVersion,
      currentAppVersion,
      currentVersionMajorMinor,
      fastInstanceCommands,
      slowInstanceCommands,
      workspaceCommands,
    };
  }

  private async runWorkspaceCommands(
    options: UpgradeCommandOptions,
    {
      currentAppVersion,
      fromWorkspaceVersion,
      workspaceCommands,
    }: VersionContext,
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
          fromWorkspaceVersion,
          currentAppVersion,
          workspaceCommands,
        });
      },
    });
  }
}
