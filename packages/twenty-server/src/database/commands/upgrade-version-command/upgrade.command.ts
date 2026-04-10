import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import {
  WorkspaceIteratorService,
  type WorkspaceIteratorReport,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { CommandLogger } from 'src/database/commands/logger';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import {
  UpgradeCommandRegistryService,
  type VersionBlock,
} from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

export type UpgradeCommandOptions = {
  workspaceId?: Set<string>;
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    protected readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
    protected readonly upgradeMigrationService: UpgradeMigrationService,
    protected readonly instanceUpgradeService: InstanceUpgradeService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    protected readonly workspaceUpgradeService: WorkspaceUpgradeService,
    protected readonly workspaceVersionService: WorkspaceVersionService,
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
      const versionBlocks =
        this.upgradeCommandRegistryService.getOrderedVersionBlocks();

      const totalSteps = versionBlocks.reduce(
        (sum, block) => sum + block.steps.length,
        0,
      );

      this.logger.log(
        chalk.blue(
          [
            'Initialized upgrade with flat timeline:',
            `- ${versionBlocks.length} version block(s)`,
            `- ${totalSteps} total step(s)`,
            ...versionBlocks.map((block) => {
              const fast = block.steps.filter(
                (step) => step.kind === 'fast-instance',
              ).length;
              const slow = block.steps.filter(
                (step) => step.kind === 'slow-instance',
              ).length;
              const workspace = block.steps.filter(
                (step) => step.kind === 'workspace',
              ).length;

              return `  ${block.version}: ${fast} fast, ${slow} slow, ${workspace} workspace`;
            }),
          ].join('\n   '),
        ),
      );

      await this.runLegacyPendingTypeOrmMigrations();

      const completedInstanceNames =
        await this.upgradeMigrationService.getCompletedCommandNames(null);

      const hasWorkspaces =
        await this.workspaceVersionService.hasActiveOrSuspendedWorkspaces();

      let totalWorkspaceSuccesses = 0;
      let totalWorkspaceFailures = 0;

      for (const versionBlock of versionBlocks) {
        const blockResult = await this.runVersionBlock({
          versionBlock,
          options,
          completedInstanceNames,
          hasWorkspaces,
        });

        totalWorkspaceSuccesses += blockResult.workspaceSuccesses;
        totalWorkspaceFailures += blockResult.workspaceFailures;

        if (blockResult.aborted) {
          break;
        }
      }

      if (hasWorkspaces) {
        this.logger.log(
          chalk.blue(
            `Upgrade summary: ${totalWorkspaceSuccesses} workspace(s) succeeded, ${totalWorkspaceFailures} workspace(s) failed`,
          ),
        );
      }

      if (totalWorkspaceFailures > 0) {
        throw new Error(
          `Upgrade completed with ${totalWorkspaceFailures} workspace failure(s)`,
        );
      }
    } catch (error) {
      this.logger.error(chalk.red(`Upgrade failed: ${error.message}`));
      throw error;
    }
  }

  private async runVersionBlock({
    versionBlock,
    options,
    completedInstanceNames,
    hasWorkspaces,
  }: {
    versionBlock: VersionBlock;
    options: UpgradeCommandOptions;
    completedInstanceNames: Set<string>;
    hasWorkspaces: boolean;
  }): Promise<{
    workspaceSuccesses: number;
    workspaceFailures: number;
    aborted: boolean;
  }> {
    const fastSteps = versionBlock.steps.filter(
      (step) => step.kind === 'fast-instance',
    );
    const slowSteps = versionBlock.steps.filter(
      (step) => step.kind === 'slow-instance',
    );
    const workspaceSteps = versionBlock.steps.filter(
      (step) => step.kind === 'workspace',
    );

    for (const step of fastSteps) {
      if (completedInstanceNames.has(step.name)) {
        continue;
      }

      const result = await this.instanceUpgradeService.runFastInstanceCommand({
        command: step.command,
        name: step.name,
      });

      if (result.status === 'failed') {
        throw result.error;
      }

      if (result.status === 'success') {
        completedInstanceNames.add(step.name);
      }
    }

    for (const step of slowSteps) {
      if (completedInstanceNames.has(step.name)) {
        continue;
      }

      const result = await this.instanceUpgradeService.runSlowInstanceCommand({
        command: step.command,
        name: step.name,
        skipDataMigration: !hasWorkspaces,
      });

      if (result.status === 'failed') {
        throw result.error;
      }

      if (result.status === 'success') {
        completedInstanceNames.add(step.name);
      }
    }

    if (!hasWorkspaces) {
      this.logger.log(
        chalk.blue(
          `No workspaces found, skipping workspace commands for ${versionBlock.version}`,
        ),
      );

      return { workspaceSuccesses: 0, workspaceFailures: 0, aborted: false };
    }

    if (workspaceSteps.length === 0) {
      return { workspaceSuccesses: 0, workspaceFailures: 0, aborted: false };
    }

    const iteratorReport = await this.runWorkspaceCommandsForVersion(
      options,
      versionBlock,
      workspaceSteps,
    );

    const workspaceSuccesses = iteratorReport.success.length;
    const workspaceFailures = iteratorReport.fail.length;

    if (workspaceFailures > 0) {
      this.logger.error(
        chalk.red(
          `Version ${versionBlock.version}: ${workspaceFailures} workspace(s) failed. ` +
            'Aborting upgrade — cannot proceed to next version block.',
        ),
      );

      return { workspaceSuccesses, workspaceFailures, aborted: true };
    }

    return { workspaceSuccesses, workspaceFailures, aborted: false };
  }

  private async runWorkspaceCommandsForVersion(
    options: UpgradeCommandOptions,
    versionBlock: VersionBlock,
    workspaceSteps: VersionBlock['steps'],
  ): Promise<WorkspaceIteratorReport> {
    const workspaceCommandEntries = workspaceSteps.map((step) => ({
      name: step.name,
      command: step.command as Parameters<
        typeof this.workspaceUpgradeService.runWorkspaceCommands
      >[0]['workspaceCommands'][number]['command'],
    }));

    return await this.workspaceIteratorService.iterate({
      workspaceIds:
        options.workspaceId && options.workspaceId.size > 0
          ? Array.from(options.workspaceId)
          : undefined,
      startFromWorkspaceId: options.startFromWorkspaceId,
      workspaceCountLimit: options.workspaceCountLimit,
      dryRun: options.dryRun,
      callback: async (context) => {
        await this.workspaceUpgradeService.runWorkspaceCommands({
          iteratorContext: context,
          options,
          version: versionBlock.version,
          workspaceCommands: workspaceCommandEntries,
        });
      },
    });
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
}
