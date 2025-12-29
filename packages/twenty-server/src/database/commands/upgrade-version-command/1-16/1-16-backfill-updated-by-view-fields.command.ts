import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldV2Service } from 'src/engine/metadata-modules/view-field/services/view-field-v2.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
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
  name: 'upgrade:1-15:backfill-updated-by-view-fields',
  description: 'Backfill updatedBy view fields for all views',
})
export class BackfillUpdatedByViewFieldsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    BackfillUpdatedByViewFieldsCommand.name,
  );

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

  private readonly objectToCreatedByStandardIdMap: Record<string, string> = {
    [STANDARD_OBJECT_IDS.attachment]: ATTACHMENT_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.company]: COMPANY_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.person]: PERSON_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.note]: NOTE_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.task]: TASK_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.opportunity]: OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.workflow]: WORKFLOW_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.workflowRun]:
      WORKFLOW_RUN_STANDARD_FIELD_IDS.createdBy,
    [STANDARD_OBJECT_IDS.dashboard]: DASHBOARD_STANDARD_FIELD_IDS.createdBy,
  };

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    private readonly viewFieldV2Service: ViewFieldV2Service,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting backfill of updatedBy view fields for workspace ${workspaceId}`,
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
        `No objects found that need updatedBy view fields for workspace ${workspaceId}`,
      );

      return;
    }

    const viewsToProcess: Array<{
      viewId: string;
      viewName: string;
      updatedByFieldMetadataId: string;
      createdByFieldMetadataId: string | null;
    }> = [];

    for (const objectMetadata of objectMetadataList) {
      let updatedByStandardId: string | undefined;
      let createdByStandardId: string | undefined;

      if (objectMetadata.isCustom) {
        updatedByStandardId = CUSTOM_OBJECT_STANDARD_FIELD_IDS.updatedBy;
        createdByStandardId = CUSTOM_OBJECT_STANDARD_FIELD_IDS.createdBy;
      } else if (objectMetadata.standardId) {
        updatedByStandardId =
          this.objectToUpdatedByStandardIdMap[objectMetadata.standardId];
        createdByStandardId =
          this.objectToCreatedByStandardIdMap[objectMetadata.standardId];
      }

      if (!updatedByStandardId) {
        continue;
      }

      const updatedByField = objectMetadata.fields.find(
        (field) => field.standardId === updatedByStandardId,
      );

      if (!updatedByField) {
        this.logger.log(
          `Object ${objectMetadata.nameSingular} (${objectMetadata.standardId || 'custom'}) does not have updatedBy field, skipping views`,
        );
        continue;
      }

      const createdByField = createdByStandardId
        ? objectMetadata.fields.find(
            (field) => field.standardId === createdByStandardId,
          )
        : null;

      const views = await this.viewRepository.find({
        where: {
          workspaceId,
          objectMetadataId: objectMetadata.id,
          deletedAt: IsNull(),
        },
      });

      for (const view of views) {
        viewsToProcess.push({
          viewId: view.id,
          viewName: view.name,
          updatedByFieldMetadataId: updatedByField.id,
          createdByFieldMetadataId: createdByField?.id ?? null,
        });
      }
    }

    if (viewsToProcess.length === 0) {
      this.logger.log(
        `No views found that need updatedBy view fields for workspace ${workspaceId}`,
      );

      return;
    }

    const viewFieldsToCreate: Array<{
      viewId: string;
      viewName: string;
      fieldMetadataId: string;
      position: number;
      isVisible: boolean;
      size: number;
    }> = [];

    const viewIds = viewsToProcess.map((view) => view.viewId);

    const allViewFields = await this.viewFieldRepository.find({
      where: {
        workspaceId,
        viewId: In(viewIds),
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['fieldMetadata'],
    });

    const viewFieldsByViewId = allViewFields.reduce(
      (acc, viewField) => {
        if (!acc[viewField.viewId]) {
          acc[viewField.viewId] = [];
        }
        acc[viewField.viewId].push(viewField);

        return acc;
      },
      {} as Record<string, ViewFieldEntity[]>,
    );

    for (const {
      viewId,
      viewName,
      updatedByFieldMetadataId,
      createdByFieldMetadataId,
    } of viewsToProcess) {
      const existingViewFields = viewFieldsByViewId[viewId] ?? [];

      const updatedByViewFieldExists = existingViewFields.some(
        (viewField) => viewField.fieldMetadataId === updatedByFieldMetadataId,
      );

      if (updatedByViewFieldExists) {
        this.logger.log(
          `View ${viewName} (${viewId}) already has updatedBy view field, skipping`,
        );
        continue;
      }

      let position: number;
      let isVisible = true;
      let size = 150;

      if (isDefined(createdByFieldMetadataId)) {
        const createdByViewField = existingViewFields.find(
          (viewField) => viewField.fieldMetadataId === createdByFieldMetadataId,
        );

        if (createdByViewField) {
          position = createdByViewField.position + 1;
          isVisible = createdByViewField.isVisible;
          size = createdByViewField.size;
        } else {
          position =
            existingViewFields.length > 0
              ? Math.max(...existingViewFields.map((vf) => vf.position)) + 1
              : 0;
        }
      } else {
        position =
          existingViewFields.length > 0
            ? Math.max(...existingViewFields.map((vf) => vf.position)) + 1
            : 0;
      }

      viewFieldsToCreate.push({
        viewId,
        viewName,
        fieldMetadataId: updatedByFieldMetadataId,
        position,
        isVisible,
        size,
      });
    }

    if (viewFieldsToCreate.length === 0) {
      this.logger.log(
        `All views already have updatedBy view fields for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${viewFieldsToCreate.length} views that need updatedBy view fields`,
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create updatedBy view fields for ${viewFieldsToCreate.length} views`,
      );

      return;
    }

    for (const {
      viewId,
      viewName,
      fieldMetadataId,
      position,
      isVisible,
      size,
    } of viewFieldsToCreate) {
      try {
        await this.viewFieldV2Service.createMany({
          createViewFieldInputs: [
            {
              viewId,
              fieldMetadataId,
              position,
              isVisible,
              size,
            },
          ],
          workspaceId,
        });

        this.logger.log(
          `Successfully created updatedBy view field for view ${viewName} (${viewId})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create updatedBy view field for view ${viewName} (${viewId}): ${error.message}`,
        );
        throw error;
      }
    }

    this.logger.log(
      `Successfully backfilled updatedBy view fields for ${viewFieldsToCreate.length} views in workspace ${workspaceId}`,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatViewFieldMaps',
    ]);
  }
}
