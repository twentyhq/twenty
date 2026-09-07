import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { splitViewFieldPositionUpdates } from 'src/database/commands/upgrade-version-command/2-25/utils/split-view-field-position-updates.util';
import { buildViewFieldsAlignedToStandardPositions } from 'src/database/commands/upgrade-version-command/2-39/utils/build-view-fields-aligned-to-standard-positions.util';
import { buildMessageCampaignSchedulingAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-39/utils/build-message-campaign-scheduling-availability-updates.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.fields.scheduledAt.universalIdentifier;

const SCHEDULED_AT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.views.allMessageCampaigns.viewFields.scheduledAt
    .universalIdentifier,
  CAMPAIGN.views.messageCampaignRecordPageFields.viewFields.scheduledAt
    .universalIdentifier,
];

const CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.views.allMessageCampaigns.universalIdentifier,
  CAMPAIGN.views.messageCampaignRecordPageFields.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.39.0', 1788783100000)
@Command({
  name: 'upgrade:2-39:add-message-campaign-scheduled-at',
  description:
    'Add the scheduledAt field to messageCampaign, surface it in the all campaigns view and the record page, and let Cancel Campaign and Send Test act on a scheduled campaign',
})
export class AddMessageCampaignScheduledAtCommand extends ProvisionedWorkspaceCommandRunner {
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
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatCommandMenuItemMaps',
    ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          CAMPAIGN.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `messageCampaign object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now,
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const fieldsToCreate = getStandardFlatEntitiesToCreateOrThrow<
      FlatFieldMetadata
    >({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
      existingFlatEntityMaps: flatFieldMetadataMaps,
      universalIdentifiers: [SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER],
    });

    const isViewProvisionedInWorkspace = ({
      viewUniversalIdentifier,
    }: FlatViewField) =>
      isDefined(flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]);

    const viewFieldsToCreate = getStandardFlatEntitiesToCreateOrThrow<
      FlatViewField
    >({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
      existingFlatEntityMaps: flatViewFieldMaps,
      universalIdentifiers: SCHEDULED_AT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
    }).filter(isViewProvisionedInWorkspace);

    const commandMenuItemsToUpdate =
      buildMessageCampaignSchedulingAvailabilityUpdates({
        flatCommandMenuItemByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        now,
      });

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewFieldsToCreate.length} view column(s), ${commandMenuItemsToUpdate.length} command update(s)`,
      );

      return;
    }

    if (
      fieldsToCreate.length > 0 ||
      viewFieldsToCreate.length > 0 ||
      commandMenuItemsToUpdate.length > 0
    ) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: fieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              viewField: {
                flatEntityToCreate: viewFieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              commandMenuItem: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: commandMenuItemsToUpdate,
              },
            },
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to add the messageCampaign scheduledAt field:\n${JSON.stringify(result, null, 2)}`,
        );

        throw new Error(
          `Failed to add the messageCampaign scheduledAt field for workspace ${workspaceId}`,
        );
      }
    }

    await this.alignCampaignViewPositionsToStandard({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });
  }

  private async alignCampaignViewPositionsToStandard({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const { flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
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

    for (const viewUniversalIdentifier of CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIERS) {
      const existingView =
        flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier];

      if (!isDefined(existingView)) {
        continue;
      }

      const viewFieldsToUpdate = buildViewFieldsAlignedToStandardPositions({
        existingView,
        flatViewFieldMaps,
        standardFlatViewFieldMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
      });

      if (viewFieldsToUpdate.length === 0) {
        continue;
      }

      const { others, lowest } =
        splitViewFieldPositionUpdates(viewFieldsToUpdate);

      for (const viewFieldBatch of [others, lowest]) {
        if (viewFieldBatch.length === 0) {
          continue;
        }

        await this.runViewFieldUpdates({
          workspaceId,
          applicationUniversalIdentifier,
          viewFieldsToUpdate: viewFieldBatch,
        });
      }
    }
  }


  private async runViewFieldUpdates({
    workspaceId,
    applicationUniversalIdentifier,
    viewFieldsToUpdate,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    viewFieldsToUpdate: FlatViewField[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: viewFieldsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to align the messageCampaign view columns:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to align the messageCampaign view columns for workspace ${workspaceId}`,
      );
    }
  }
}
