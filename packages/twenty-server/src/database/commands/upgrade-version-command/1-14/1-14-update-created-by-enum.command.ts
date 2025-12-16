import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';

@Command({
  name: 'upgrade:1-14:udpate-created-by-enum',
  description: 'Add new APPLICATION value to createdBy enum',
})
export class UpdateCreatedByEnumCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(UpdateCreatedByEnumCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(FieldMetadataEntity)
    protected readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    if (!isDefined(dataSource)) {
      throw new Error(
        `Could not find data source for workspace ${workspaceId}, should never occur`,
      );
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdByFields = await this.fieldMetadataRepository.find({
      where: { workspaceId, name: 'createdBy', type: FieldMetadataType.ACTOR },
      relations: ['object'],
    });

    if (isDryRun) {
      this.logger.log(
        `Dry run mode: found ${createdByFields.length} createdBy enums to update`,
      );
    }

    if (!options.dryRun) {
      this.logger.log(`Updating ${createdByFields.length} createdBy enums`);
      try {
        for (const createdByField of createdByFields) {
          const tableName = computeTableName(
            createdByField.object.nameSingular,
            createdByField.object.isCustom,
          );
          const createdByEnumName = computePostgresEnumName({
            tableName,
            columnName: 'createdBySource',
          });

          await queryRunner.query(
            `ALTER TYPE "${schemaName}"."${createdByEnumName}" ADD VALUE IF NOT EXISTS 'APPLICATION'`,
          );
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.log(
          `Rollbacking UpdateCreatedByEnumCommand: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    }
  }
}
