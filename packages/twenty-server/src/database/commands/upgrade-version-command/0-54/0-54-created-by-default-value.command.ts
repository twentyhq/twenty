import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Command({
  name: 'upgrade:0-54:0-54-created-by-default-value',
  description: 'Fix createdBy default value',
})
export class FixCreatedByDefaultValueCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const objectsMetadataItems = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: ['fields'],
    });

    for (const objectMetadataItem of objectsMetadataItems) {
      const createdByFieldExists = objectMetadataItem.fields.some(
        (field) => field.type === FieldMetadataType.ACTOR,
      );

      if (!createdByFieldExists) {
        continue;
      }

      const schemaName =
        this.workspaceDataSourceService.getSchemaName(workspaceId);

      const tableName = computeTableName(
        objectMetadataItem.nameSingular,
        objectMetadataItem.isCustom,
      );

      const actualDefaultValue = (
        await dataSource.query(`
          SELECT column_default FROM information_schema.columns
            WHERE table_schema = '${schemaName}'
              AND table_name = '${tableName}'
              AND column_name = 'createdBySource';
          `)
      )?.[0]?.column_default;

      if (actualDefaultValue !== null) {
        continue;
      }

      const createdByDefaultValues = generateDefaultValue(
        FieldMetadataType.ACTOR,
      ) as ActorMetadata;

      await dataSource.query(`
          ALTER TABLE "${schemaName}"."${tableName}"
              ALTER COLUMN "createdBySource" SET DEFAULT ${createdByDefaultValues.source},
              ALTER COLUMN "createdByName" SET DEFAULT ${createdByDefaultValues.name},
              ALTER COLUMN "createdByContext" SET DEFAULT '${JSON.stringify(createdByDefaultValues.context)}';
      `);
    }
  }
}
