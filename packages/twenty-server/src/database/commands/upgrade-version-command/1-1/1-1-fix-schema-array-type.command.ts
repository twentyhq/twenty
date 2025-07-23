import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { DatabaseStructureService } from 'src/engine/workspace-manager/workspace-health/services/database-structure.service';

@Command({
  name: 'upgrade:1-1:fix-schema-array-type',
  description: 'Fix columns for ARRAY fields to be text[] in the DB schema',
})
export class FixSchemaArrayTypeCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly databaseStructureService: DatabaseStructureService,
    private readonly typeORMService: TypeORMService,
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(`Fixing ARRAY field columns for workspace ${workspaceId}`);

    const arrayFields: FieldMetadataEntity[] =
      await this.fieldMetadataRepository.find({
        where: {
          workspaceId,
          type: FieldMetadataType.ARRAY,
          isCustom: true,
        },
        relations: ['object'],
      });

    if (arrayFields.length === 0) {
      this.logger.log('No ARRAY fields found for this workspace.');

      return;
    }

    for (const field of arrayFields) {
      const object = field.object;

      const tableName = computeObjectTargetTable(object);
      const schemaName = getWorkspaceSchemaName(workspaceId);
      const columns =
        await this.databaseStructureService.getWorkspaceTableColumns(
          schemaName,
          tableName,
        );
      const columnName = computeColumnName(field);
      const dbColumn = columns.find((col) => col.columnName === columnName);

      if (!dbColumn) {
        this.logger.warn(
          `Column ${columnName} not found in table ${schemaName}.${tableName}`,
        );
        continue;
      }
      if (dbColumn.dataType === 'text[]' && dbColumn.isArray) {
        continue;
      }
      this.logger.log(
        `Altering column ${schemaName}.${tableName}.${columnName} to type text[] (was ${dbColumn.dataType})`,
      );
      if (!options.dryRun) {
        const queryRunner = this.typeORMService
          .getMainDataSource()
          .createQueryRunner();

        await queryRunner.connect();
        try {
          await queryRunner.query(
            `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${columnName}" TYPE text[] USING "${columnName}"::text[];`,
          );
        } finally {
          await queryRunner.release();
        }
      }
    }
  }
}
