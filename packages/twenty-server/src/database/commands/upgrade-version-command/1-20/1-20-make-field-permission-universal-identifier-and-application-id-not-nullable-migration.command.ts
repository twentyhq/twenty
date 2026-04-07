import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { makeFieldPermissionUniversalIdentifierAndApplicationIdNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1773400000000-make-field-permission-universal-identifier-and-application-id-not-null.util';

@Command({
  name: 'upgrade:1-20:make-field-permission-universal-identifier-and-application-id-not-nullable-migration',
  description:
    'Set NOT NULL on fieldPermission universalIdentifier and applicationId, add unique index and FK (run identify-field-permission-metadata first)',
})
export class MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
        'Skipping has already been run once MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand',
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
      await makeFieldPermissionUniversalIdentifierAndApplicationIdNotNullQueries(
        queryRunner,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
