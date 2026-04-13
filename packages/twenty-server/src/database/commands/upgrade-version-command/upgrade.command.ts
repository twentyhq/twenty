import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { RemovedSinceVersion } from 'src/engine/core-modules/upgrade/types/removed-since-version.type';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import { isDefined } from 'twenty-shared/utils';

type RawUpgradeCommandOptions = {
  workspaceId?: Set<string>;
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

export type ParsedUpgradeCommandOptions = {
  workspaceIds?: string[];
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
    protected readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    protected readonly upgradeSequenceRunnerService: UpgradeSequenceRunnerService,
    protected readonly upgradeMigrationService: UpgradeMigrationService,
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
    options: RawUpgradeCommandOptions,
  ): Promise<void> {
    if (options.verbose) {
      this.logger = new CommandLogger({
        verbose: true,
        constructorName: this.constructor.name,
      });
    }

    try {
      await this.runBootstrapMigrations();
      await this.backfillWorkspaceCreatedIn1_21_0Cursors();

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

      const { totalSuccesses, totalFailures } =
        await this.upgradeSequenceRunnerService.run({
          sequence,
          options: {
            ...options,
            workspaceIds: isDefined(options.workspaceId)
              ? Array.from(options.workspaceId)
              : undefined,
          },
        });

      this.logger.log(
        chalk.blue(
          `Upgrade summary: ${totalSuccesses} workspace(s) succeeded, ${totalFailures} workspace(s) failed`,
        ),
      );

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

  // Workspaces created during 1.21 were activated before the cursor-based
  // upgrade system existed. They have no upgradeMigration record yet.
  // Stamp them with the last 1.21 workspace command as their initial cursor.
  private async backfillWorkspaceCreatedIn1_21_0Cursors(): RemovedSinceVersion<
    '1.23.0',
    Promise<void>
  > {
    const allWorkspaceIds =
      await this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds();

    if (allWorkspaceIds.length === 0) {
      return;
    }

    const existingCursorWorkspaceIds: { workspaceId: string }[] =
      await this.dataSource.query(
        `SELECT DISTINCT "workspaceId" FROM "core"."upgradeMigration" WHERE "workspaceId" IS NOT NULL`,
      );

    const existingCursorSet = new Set(
      existingCursorWorkspaceIds.map((row) => row.workspaceId),
    );

    const workspacesWithoutCursor = allWorkspaceIds.filter(
      (workspaceId) => !existingCursorSet.has(workspaceId),
    );

    if (workspacesWithoutCursor.length === 0) {
      return;
    }

    const lastWorkspaceCommand =
      this.upgradeCommandRegistryService.getLastWorkspaceCommandForVersion(
        '1.21.0',
      );

    if (!lastWorkspaceCommand) {
      throw new Error(
        `Cannot backfill workspace cursors: no workspace commands found for version 1.21.0`,
      );
    }

    this.logger.log(
      chalk.blue(
        `Backfilling initial cursor for ${workspacesWithoutCursor.length} workspace(s) → "${lastWorkspaceCommand.name}"`,
      ),
    );

    for (const workspaceId of workspacesWithoutCursor) {
      await this.upgradeMigrationService.markAsInitial({
        name: lastWorkspaceCommand.name,
        workspaceId,
        executedByVersion: '1.21.0',
      });
    }
  }

  // Schema changes required by the upgrade engine itself (e.g. new columns
  // on upgradeMigration) must be applied before the sequence runs.
  private async runBootstrapMigrations(): RemovedSinceVersion<
    '1.23.0',
    Promise<void>
  > {
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
    await queryRunner.startTransaction();

    try {
      await migration.up(queryRunner);

      await queryRunner.query(
        `INSERT INTO "core"."_typeorm_migrations" ("timestamp", "name") VALUES ($1, $2)`,
        [1775909335324, BOOTSTRAP_MIGRATION],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
