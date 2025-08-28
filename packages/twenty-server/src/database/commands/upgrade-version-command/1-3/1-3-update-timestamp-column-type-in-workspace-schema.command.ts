import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-3:update-timestamp-column-type-in-workspace-schema',
  description:
    'Update the timestamp column type in all the workspace schema tables',
})
export class UpdateTimestampColumnTypeInWorkspaceSchemaCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dateTimeFieldMetadataItems = await this.fieldMetadataRepository.find({
      where: {
        workspaceId,
        type: FieldMetadataType.DATE_TIME,
      },
      relations: ['object'],
    });

    const schemaName = getWorkspaceSchemaName(workspaceId);

    for (const fieldMetadataItem of dateTimeFieldMetadataItems) {
      this.logger.log(
        `Updating column type for ${fieldMetadataItem.name} in ${schemaName}."${computeObjectTargetTable(fieldMetadataItem.object)}"`,
      );
      await this.coreDataSource.query(
        `ALTER TABLE ${schemaName}."${computeObjectTargetTable(fieldMetadataItem.object)}"
        ALTER COLUMN "${fieldMetadataItem.name}" TYPE timestamptz(3);`,
      );
    }
  }
}
