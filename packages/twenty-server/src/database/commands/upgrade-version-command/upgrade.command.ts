import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
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
    protected readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    protected readonly upgradeSequenceRunnerService: UpgradeSequenceRunnerService,
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
      await this.runBootstrapMigrations();

      const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

      this.logger.log(
        chalk.blue(
          [
            'Initialized upgrade sequence:',
            `- ${sequence.length} step(s)`,
            ...sequence.map(
              (step, index) =>
                `  [${index}] ${step.kind} — ${step.name} (${step.version})`,
            ),
          ].join('\n   '),
        ),
      );

      const hasWorkspaces =
        await this.workspaceVersionService.hasActiveOrSuspendedWorkspaces();

      const activeWorkspaceIds = hasWorkspaces
        ? await this.getActiveWorkspaceIds(options)
        : [];

      const { totalSuccesses, totalFailures } =
        await this.upgradeSequenceRunnerService.run({
          sequence,
          activeWorkspaceIds,
          options,
        });

      if (hasWorkspaces) {
        this.logger.log(
          chalk.blue(
            `Upgrade summary: ${totalSuccesses} workspace(s) succeeded, ${totalFailures} workspace(s) failed`,
          ),
        );
      }

      if (totalFailures > 0) {
        throw new Error(
          `Upgrade completed with ${totalFailures} workspace failure(s)`,
        );
      }
    } catch (error) {
      this.logger.error(chalk.red(`Upgrade failed: ${error.message}`));
      throw error;
    }
  }

  // Schema changes required by the upgrade engine itself (e.g. new columns
  // on upgradeMigration) must be applied before the sequence runs.
  // Only the specific bootstrap migration is executed here.
  // To remove starting from 1.23
  private async runBootstrapMigrations(): Promise<void> {
    const BOOTSTRAP_MIGRATION = 'AddIsInitialToUpgradeMigration1775909335324';

    const alreadyExecuted = await this.dataSource.query(
      `SELECT 1 FROM "core"."_typeorm_migrations" WHERE "name" = $1`,
      [BOOTSTRAP_MIGRATION],
    );

    if (alreadyExecuted.length > 0) {
      return;
    }

    const migration = this.dataSource.migrations.find(
      (migration) => migration.name === BOOTSTRAP_MIGRATION,
    );

    if (!migration) {
      throw new Error(
        `Bootstrap migration "${BOOTSTRAP_MIGRATION}" not found in registered migrations`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await migration.up(queryRunner);

      await queryRunner.query(
        `INSERT INTO "core"."_typeorm_migrations" ("timestamp", "name") VALUES ($1, $2)`,
        [1775909335324, BOOTSTRAP_MIGRATION],
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async getActiveWorkspaceIds(
    options: UpgradeCommandOptions,
  ): Promise<string[]> {
    if (options.workspaceId && options.workspaceId.size > 0) {
      return Array.from(options.workspaceId);
    }

    return this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds({
      startFromWorkspaceId: options.startFromWorkspaceId,
      workspaceCountLimit: options.workspaceCountLimit,
    });
  }
}
