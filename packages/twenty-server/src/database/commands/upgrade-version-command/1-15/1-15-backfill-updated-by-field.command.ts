import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
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
  name: 'upgrade:1-15:backfill-updated-by-field',
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
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
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

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const objectMetadataList = Object.values(
      flatObjectMetadataMaps.byId,
    ).filter(isDefined);

    if (objectMetadataList.length === 0) {
      this.logger.log(
        `No objects found that need updatedBy field for workspace ${workspaceId}`,
      );

      return;
    }

    const createFieldInputs: CreateFieldInput[] = [];

    for (const flatObjectMetadata of objectMetadataList) {
      const isStandardObject = isStandardMetadata(flatObjectMetadata);
      const updatedByStandardId = !isStandardObject
        ? CUSTOM_OBJECT_STANDARD_FIELD_IDS.updatedBy
        : isDefined(flatObjectMetadata.standardId)
          ? this.objectToUpdatedByStandardIdMap[flatObjectMetadata.standardId]
          : undefined;

      if (!isDefined(updatedByStandardId)) {
        continue;
      }

      const flatFieldMetadatas = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: flatObjectMetadata.fieldMetadataIds,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      const updatedByField = flatFieldMetadatas.find(
        (field) => field.standardId === updatedByStandardId,
      );

      if (isDefined(updatedByField)) {
        this.logger.log(
          `Object ${flatObjectMetadata.nameSingular} (${flatObjectMetadata.standardId || 'custom'}) already has updatedBy field, skipping`,
        );
        continue;
      }

      const applicationId = isStandardObject
        ? twentyStandardFlatApplication.id
        : workspaceCustomFlatApplication.id;
      const universalIdentifier = isStandardObject ? updatedByStandardId : v4();

      createFieldInputs.push({
        workspaceId,
        objectMetadataId: flatObjectMetadata.id,
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
        standardId: updatedByStandardId,
        universalIdentifier,
        applicationId,
      });
    }

    if (createFieldInputs.length === 0) {
      this.logger.log(
        `All objects already have updatedBy field for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${createFieldInputs.length} objects that need updatedBy field`,
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create updatedBy field for ${createFieldInputs.length} objects`,
      );

      return;
    }

    try {
      await this.fieldMetadataService.createManyFields({
        createFieldInputs,
        workspaceId,
        isSystemBuild: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to create many fields \n ${JSON.stringify(error, null, 2)}`,
      );
      throw error;
    }

    this.logger.log(
      `Successfully backfilled updatedBy field for ${createFieldInputs.length} objects in workspace ${workspaceId}`,
    );
  }
}
