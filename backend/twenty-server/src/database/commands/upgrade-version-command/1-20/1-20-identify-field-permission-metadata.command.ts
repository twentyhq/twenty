import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, IsNull, type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-20:identify-field-permission-metadata',
  description:
    'Identify field permission metadata (backfill universalIdentifier and applicationId)',
})
export class IdentifyFieldPermissionMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRunOnce = false;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.log(
        'Skipping has already been run once IdentifyFieldPermissionMetadataCommand',
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
      const repository = queryRunner.manager.getRepository(
        FieldPermissionEntity,
      );
      const withNullApplicationId = await repository.find({
        where: { applicationId: IsNull() },
        relations: ['role'],
      });

      const toUpdate = withNullApplicationId.filter((fieldPermission) =>
        isDefined(fieldPermission.role?.applicationId),
      );
      const toRemove = withNullApplicationId.filter(
        (fieldPermission) => !isDefined(fieldPermission.role?.applicationId),
      );

      for (const fieldPermission of toUpdate) {
        fieldPermission.applicationId = fieldPermission.role!.applicationId;
        fieldPermission.universalIdentifier =
          fieldPermission.universalIdentifier ?? v4();
      }

      if (toUpdate.length > 0) {
        await repository.save(toUpdate);
      }
      if (toRemove.length > 0) {
        await repository.remove(toRemove);
      }

      const withNullUniversalIdentifier = await repository.find({
        where: { universalIdentifier: IsNull() },
      });

      for (const fieldPermission of withNullUniversalIdentifier) {
        fieldPermission.universalIdentifier = v4();
      }

      if (withNullUniversalIdentifier.length > 0) {
        await repository.save(withNullUniversalIdentifier);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run IdentifyFieldPermissionMetadataCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back IdentifyFieldPermissionMetadataCommand: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
