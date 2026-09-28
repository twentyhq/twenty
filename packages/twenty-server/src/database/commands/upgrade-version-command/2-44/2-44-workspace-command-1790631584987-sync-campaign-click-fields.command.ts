import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const CLICK_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.campaignDelivery.fields.clickedAt.universalIdentifier,
  STANDARD_OBJECTS.campaignDelivery.fields.clickCount.universalIdentifier,
  STANDARD_OBJECTS.messageCampaign.fields.clickedCount.universalIdentifier,
  STANDARD_OBJECTS.messageCampaign.fields.clickCount.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.44.0', 1790631584987)
@Command({
  name: 'upgrade:2-44:sync-campaign-click-fields',
  description:
    'Add the click count fields to campaigns and deliveries in existing workspaces',
})
export class SyncCampaignClickFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(
        `Skipping campaign click fields upgrade for workspace ${workspaceId}: no workspace data source`,
      );

      return;
    }

    const queryRunner = dataSource.createQueryRunner('master');

    try {
      await queryRunner.connect();

      if (!(await queryRunner.hasSchema(getWorkspaceSchemaName(workspaceId)))) {
        this.logger.log(
          `Skipping campaign click fields upgrade for workspace ${workspaceId}: workspace schema is absent`,
        );

        return;
      }
    } finally {
      await queryRunner.release();
    }

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const flatFieldMetadataToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: CLICK_FIELD_UNIVERSAL_IDENTIFIERS,
      });

    if (flatFieldMetadataToCreate.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${flatFieldMetadataToCreate.length} click field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to create the campaign click fields for workspace ${workspaceId}`,
      );
    }
  }
}
