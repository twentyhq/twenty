import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  ATTACHMENT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  DASHBOARD_STANDARD_FIELD_IDS,
  NOTE_STANDARD_FIELD_IDS,
  OPPORTUNITY_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
  WORKFLOW_RUN_STANDARD_FIELD_IDS,
  WORKFLOW_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

@Command({
  name: 'upgrade:1-16:backfill-updated-by-field',
  description: 'Backfill updatedBy field for all objects',
})
export class BackfillUpdatedByFieldCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(BackfillUpdatedByFieldCommand.name);

  private readonly objectToUpdatedByStandardIdMap: Record<string, string> = {
    [STANDARD_OBJECT_IDS.attachment]: ATTACHMENT_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.company]: COMPANY_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.person]: PERSON_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.note]: NOTE_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.task]: TASK_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.opportunity]: OPPORTUNITY_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.workflow]: WORKFLOW_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.workflowRun]:
      WORKFLOW_RUN_STANDARD_FIELD_IDS.updatedBy,
    [STANDARD_OBJECT_IDS.dashboard]: DASHBOARD_STANDARD_FIELD_IDS.updatedBy,
  };

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting backfill of updatedBy field for workspace ${workspaceId}`,
    );

    const standardObjectMetadataList = await this.objectMetadataRepository.find(
      {
        where: {
          workspaceId,
          standardId: In(Object.keys(this.objectToUpdatedByStandardIdMap)),
        },
        relations: ['fields'],
      },
    );

    const customObjectMetadataList = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        isCustom: true,
      },
      relations: ['fields'],
    });

    const objectMetadataList = [
      ...standardObjectMetadataList,
      ...customObjectMetadataList,
    ];

    if (objectMetadataList.length === 0) {
      this.logger.log(
        `No objects found that need updatedBy field for workspace ${workspaceId}`,
      );

      return;
    }

    const fieldsToCreate: Array<{
      objectMetadataId: string;
      standardId: string;
      label: string;
    }> = [];

    for (const objectMetadata of objectMetadataList) {
      let updatedByStandardId: string | undefined;

      if (objectMetadata.isCustom) {
        updatedByStandardId = CUSTOM_OBJECT_STANDARD_FIELD_IDS.updatedBy;
      } else if (objectMetadata.standardId) {
        updatedByStandardId =
          this.objectToUpdatedByStandardIdMap[objectMetadata.standardId];
      }

      if (!updatedByStandardId) {
        continue;
      }

      const updatedByField = objectMetadata.fields.find(
        (field) => field.standardId === updatedByStandardId,
      );

      if (updatedByField) {
        this.logger.log(
          `Object ${objectMetadata.nameSingular} (${objectMetadata.standardId || 'custom'}) already has updatedBy field, skipping`,
        );
        continue;
      }

      fieldsToCreate.push({
        objectMetadataId: objectMetadata.id,
        standardId: updatedByStandardId,
        label: objectMetadata.labelSingular,
      });
    }

    if (fieldsToCreate.length === 0) {
      this.logger.log(
        `All objects already have updatedBy field for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${fieldsToCreate.length} objects that need updatedBy field`,
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create updatedBy field for ${fieldsToCreate.length} objects`,
      );

      return;
    }

    for (const { objectMetadataId, standardId, label } of fieldsToCreate) {
      try {
        await this.fieldMetadataService.createManyFields({
          createFieldInputs: [
            {
              objectMetadataId,
              name: 'updatedBy',
              type: FieldMetadataType.ACTOR,
              label: 'Updated by',
              description: 'The user who last updated the record',
              icon: 'IconUserCircle',
              isNullable: true,
              isUIReadOnly: true,
              isCustom: false,
              isSystem: false,
              isActive: true,
              standardId,
            },
          ],
          workspaceId,
        });

        this.logger.log(
          `Successfully created updatedBy field for object ${label} (${objectMetadataId})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create updatedBy field for object ${label} (${objectMetadataId}): ${error.message}`,
        );
        throw error;
      }
    }

    this.logger.log(
      `Successfully backfilled updatedBy field for ${fieldsToCreate.length} objects in workspace ${workspaceId}`,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);
  }
}
