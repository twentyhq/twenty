import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const STAT_FIELD_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.fields.sentCount.universalIdentifier,
  CAMPAIGN.fields.failedCount.universalIdentifier,
  CAMPAIGN.fields.bouncedCount.universalIdentifier,
  CAMPAIGN.fields.complainedCount.universalIdentifier,
];

// The allMessageCampaigns view is introduced by this feature, so existing
// workspaces have no messageCampaign view at all. Create the view and every one
// of its columns (not just the stat columns) so it materializes end to end.
const CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.views.allMessageCampaigns.universalIdentifier;

const CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  CAMPAIGN.views.allMessageCampaigns.viewFields,
).map((viewField) => viewField.universalIdentifier);

@RegisteredWorkspaceCommand('2.20.0', 1825000010000)
@Command({
  name: 'upgrade:2-20:add-message-campaign-stat-fields',
  description:
    'Add the MessageCampaign delivery-stat fields (sent/failed/bounced/complained) and their view columns, and backfill counts on existing workspaces',
})
export class AddMessageCampaignStatFieldsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

    const campaignObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: CAMPAIGN.universalIdentifier,
      });

    if (!isDefined(campaignObjectMetadata)) {
      this.logger.log(
        `messageCampaign object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

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

    const fieldsToCreate = STAT_FIELD_UNIVERSAL_IDENTIFIERS.filter(
      (universalIdentifier) =>
        !isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
        ),
    ).map((universalIdentifier) => {
      const standardField =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
          universalIdentifier,
        });

      if (!isDefined(standardField)) {
        throw new Error(
          `Standard application is missing messageCampaign field ${universalIdentifier}`,
        );
      }

      return standardField;
    });

    const viewsToCreate = isDefined(
      flatViewMaps.byUniversalIdentifier[CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER],
    )
      ? []
      : [
          (() => {
            const standardView = findFlatEntityByUniversalIdentifier<FlatView>({
              flatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
              universalIdentifier: CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER,
            });

            if (!isDefined(standardView)) {
              throw new Error(
                `Standard application is missing messageCampaign view ${CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER}`,
              );
            }

            return standardView;
          })(),
        ];

    const viewFieldsToCreate = CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.filter(
      (universalIdentifier) =>
        !isDefined(flatViewFieldMaps.byUniversalIdentifier[universalIdentifier]),
    ).map((universalIdentifier) => {
      const standardViewField = findFlatEntityByUniversalIdentifier<FlatViewField>(
        {
          flatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
          universalIdentifier,
        },
      );

      if (!isDefined(standardViewField)) {
        throw new Error(
          `Standard application is missing messageCampaign view column ${universalIdentifier}`,
        );
      }

      return standardViewField;
    });

    const hasMetadataChanges =
      fieldsToCreate.length > 0 ||
      viewsToCreate.length > 0 ||
      viewFieldsToCreate.length > 0;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewsToCreate.length} view(s), ${viewFieldsToCreate.length} view column(s), then backfill campaign counts`,
      );

      return;
    }

    if (hasMetadataChanges) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
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
              view: {
                flatEntityToCreate: viewsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              viewField: {
                flatEntityToCreate: viewFieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to add messageCampaign stat fields:\n${JSON.stringify(result, null, 2)}`,
        );

        throw new Error(
          `Failed to add messageCampaign stat fields for workspace ${workspaceId}`,
        );
      }
    }

    await this.messageCampaignStatisticsService.refreshAllCampaignCounts(
      workspaceId,
    );

    this.logger.log(
      `Applied messageCampaign stat fields and backfilled counts for workspace ${workspaceId}`,
    );
  }
}
