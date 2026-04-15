import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

type RunSingleMigrationResult =
  | { status: 'success' }
  | { status: 'already-executed' }
  | { status: 'failed'; error: unknown };

@Injectable()
export class InstanceCommandRunnerService {
  private readonly logger = new Logger(InstanceCommandRunnerService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly workspaceVersionService: WorkspaceVersionService,
  ) {}

  async runFastInstanceCommand({
    command,
    name,
  }: {
    command: FastInstanceCommand;
    name: string;
  }): Promise<RunSingleMigrationResult> {
    const executedByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const isAlreadyCompleted =
      await this.upgradeMigrationService.isLastAttemptCompleted({
        name,
        workspaceId: null,
      });

    if (isAlreadyCompleted) {
      this.logger.log(`${name} already executed, skipping`);

      return { status: 'already-executed' };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await command.up(queryRunner);

      const workspaceIds =
        await this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds({
          queryRunner,
        });

      await this.upgradeMigrationService.recordUpgradeMigration({
        name,
        workspaceIds,
        isInstance: true,
        status: 'completed',
        executedByVersion,
        queryRunner,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      const workspaceIds =
        await this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds();

      await this.upgradeMigrationService.recordUpgradeMigration({
        name,
        workspaceIds,
        isInstance: true,
        status: 'failed',
        executedByVersion,
        error,
      });

      this.logger.error(
        `${name} failed`,
        error instanceof Error ? error.stack : String(error),
      );

      return { status: 'failed', error };
    } finally {
      await queryRunner.release();
    }

    this.logger.log(`${name} executed successfully`);

    return { status: 'success' };
  }

  async runSlowInstanceCommand({
    command,
    name,
    skipDataMigration,
  }: {
    command: SlowInstanceCommand;
    name: string;
    skipDataMigration?: boolean;
  }): Promise<RunSingleMigrationResult> {
    const isAlreadyCompleted =
      await this.upgradeMigrationService.isLastAttemptCompleted({
        name,
        workspaceId: null,
      });

    if (isAlreadyCompleted) {
      this.logger.log(`${name} already executed, skipping`);

      return { status: 'already-executed' };
    }

    if (!skipDataMigration) {
      const executedByVersion =
        this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

      try {
        await command.runDataMigration(this.dataSource);
      } catch (error) {
        const workspaceIds =
          await this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds();

        await this.upgradeMigrationService.recordUpgradeMigration({
          name,
          workspaceIds,
          isInstance: true,
          status: 'failed',
          executedByVersion,
          error,
        });

        this.logger.error(
          `${name} data migration failed`,
          error instanceof Error ? error.stack : String(error),
        );

        return { status: 'failed', error };
      }
    }

    return this.runFastInstanceCommand({
      command,
      name,
    });
  }
}
