import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

@Command({
  name: 'upgrade:1-16:backfill-opportunity-owner-field',
  description: 'Backfill owner field for opportunity object',
})
export class BackfillOpportunityOwnerFieldCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    BackfillOpportunityOwnerFieldCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
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
      `Starting backfill of owner field for opportunity in workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
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

    const opportunityObjectMetadata = Object.values(
      flatObjectMetadataMaps.byId,
    ).find(
      (obj) =>
        isDefined(obj) && obj.standardId === STANDARD_OBJECT_IDS.opportunity,
    );

    if (!isDefined(opportunityObjectMetadata)) {
      this.logger.log(
        `Opportunity object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workspaceMemberObjectMetadata = Object.values(
      flatObjectMetadataMaps.byId,
    ).find(
      (obj) =>
        isDefined(obj) &&
        obj.standardId === STANDARD_OBJECT_IDS.workspaceMember,
    );

    if (!isDefined(workspaceMemberObjectMetadata)) {
      this.logger.log(
        `WorkspaceMember object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const flatFieldMetadatas = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: opportunityObjectMetadata.fieldIds,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    const ownerUniversalIdentifier =
      STANDARD_OBJECTS.opportunity.fields.owner.universalIdentifier;

    const ownerField = flatFieldMetadatas.find(
      (field) => field.universalIdentifier === ownerUniversalIdentifier,
    );

    if (isDefined(ownerField)) {
      this.logger.log(
        `Opportunity already has owner field in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const customOwnerField = flatFieldMetadatas.find(
      (field) =>
        field.name === 'owner' &&
        field.universalIdentifier !== ownerUniversalIdentifier,
    );

    if (isDefined(customOwnerField)) {
      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would rename custom owner field to 'ownerOld' in workspace ${workspaceId}`,
        );
      } else {
        await this.fieldMetadataService.updateOneField({
          updateFieldInput: {
            id: customOwnerField.id,
            name: 'ownerOld',
            label: 'Owner (Old)',
          },
          workspaceId,
          isSystemBuild: true,
        });

        this.logger.log(
          `Renamed custom owner field to 'ownerOld' in workspace ${workspaceId}`,
        );
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create owner field for opportunity in workspace ${workspaceId}`,
      );

      return;
    }

    const createFieldInput: CreateFieldInput = {
      workspaceId,
      objectMetadataId: opportunityObjectMetadata.id,
      name: 'owner',
      type: FieldMetadataType.RELATION,
      label: 'Owner',
      description: 'Opportunity owner',
      icon: 'IconUserCircle',
      isNullable: true,
      isCustom: false,
      isSystem: false,
      isActive: true,
      standardId: ownerUniversalIdentifier,
      universalIdentifier: ownerUniversalIdentifier,
      applicationId: twentyStandardFlatApplication.id,
      relationCreationPayload: {
        type: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: workspaceMemberObjectMetadata.id,
        targetFieldLabel: 'Owned opportunities',
        targetFieldIcon: 'IconTargetArrow',
      },
    };

    const ownedOpportunitiesUniversalIdentifier =
      STANDARD_OBJECTS.workspaceMember.fields.ownedOpportunities
        .universalIdentifier;

    try {
      await this.fieldMetadataService.createManyFields({
        createFieldInputs: [createFieldInput],
        workspaceId,
        isSystemBuild: true,
      });

      this.logger.log(
        `Created owner field for opportunity in workspace ${workspaceId}`,
      );

      const ownedOpportunitiesField =
        await this.fieldMetadataRepository.findOne({
          where: {
            workspaceId,
            objectMetadataId: workspaceMemberObjectMetadata.id,
            name: 'ownedOpportunities',
          },
        });

      if (isDefined(ownedOpportunitiesField)) {
        await this.fieldMetadataRepository.update(
          { id: ownedOpportunitiesField.id },
          {
            universalIdentifier: ownedOpportunitiesUniversalIdentifier,
            standardId: ownedOpportunitiesUniversalIdentifier,
            applicationId: twentyStandardFlatApplication.id,
          },
        );

        this.logger.log(
          `Updated ownedOpportunities field universalIdentifier in workspace ${workspaceId}`,
        );

        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'flatFieldMetadataMaps',
        ]);
      } else {
        throw new Error(
          `Should never occur could not find the created ownedOpportunities field`,
        );
      }

      this.logger.log(
        `Successfully backfilled owner field for opportunity in workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create owner field for opportunity in workspace ${workspaceId}`,
        error,
      );
      throw error;
    }
  }
}
