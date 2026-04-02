import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { makePermissionFlagUniversalIdentifierAndApplicationIdNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1773232418467-make-permission-flag-universal-identifier-and-application-id-not-null.util';

@Command({
  name: 'upgrade:1-20:make-permission-flag-universal-identifier-and-application-id-not-nullable-migration',
  description:
    'Set NOT NULL on permissionFlag universalIdentifier and applicationId, add unique index and FK (run identify-permission-flag-metadata first)',
})
export class MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  private hasRunOnce = false;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.log(
        'Skipping has already been run once MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand',
      );

      return;
    }

    if (options.dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await makePermissionFlagUniversalIdentifierAndApplicationIdNotNullQueries(
        queryRunner,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
