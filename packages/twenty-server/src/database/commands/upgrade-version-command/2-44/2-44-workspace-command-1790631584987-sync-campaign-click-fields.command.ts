import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;
const DELIVERY = STANDARD_OBJECTS.campaignDelivery;

const CLICK_FIELD_UNIVERSAL_IDENTIFIERS = [
  DELIVERY.fields.clickedAt.universalIdentifier,
  DELIVERY.fields.clickCount.universalIdentifier,
  CAMPAIGN.fields.clickedCount.universalIdentifier,
  CAMPAIGN.fields.clickCount.universalIdentifier,
];

const CLICK_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.views.allMessageCampaigns.viewFields.clickedCount
    .universalIdentifier,
  CAMPAIGN.views.allMessageCampaigns.viewFields.clickCount.universalIdentifier,
  CAMPAIGN.views.messageCampaignRecordPageFields.viewFields.clickedCount
    .universalIdentifier,
  CAMPAIGN.views.messageCampaignRecordPageFields.viewFields.clickCount
    .universalIdentifier,
];

@RegisteredWorkspaceCommand('2.44.0', 1790631584987)
@Command({
  name: 'upgrade:2-44:sync-campaign-click-fields',
  description:
    'Add the click count fields to campaigns and deliveries, and their columns, in existing workspaces',
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
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
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

    const fieldsToCreate = CLICK_FIELD_UNIVERSAL_IDENTIFIERS.filter(
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
          `Standard application is missing click field ${universalIdentifier}`,
        );
      }

      return standardField;
    });

    // A workspace that never got the campaign views has no place for the
    // columns; the view backfill command owns those workspaces.
    const viewFieldsToCreate = CLICK_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.filter(
      (universalIdentifier) =>
        !isDefined(
          flatViewFieldMaps.byUniversalIdentifier[universalIdentifier],
        ),
    ).flatMap((universalIdentifier) => {
      const standardViewField =
        findFlatEntityByUniversalIdentifier<FlatViewField>({
          flatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
          universalIdentifier,
        });

      if (!isDefined(standardViewField)) {
        throw new Error(
          `Standard application is missing click view column ${universalIdentifier}`,
        );
      }

      const viewUniversalIdentifier =
        standardAllFlatEntityMaps.flatViewMaps.universalIdentifierById[
          standardViewField.viewId
        ];
      const hasView =
        isDefined(viewUniversalIdentifier) &&
        isDefined(flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]);

      return hasView ? [standardViewField] : [];
    });

    if (fieldsToCreate.length === 0 && viewFieldsToCreate.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} click field(s), ${viewFieldsToCreate.length} view column(s)`,
      );

      return;
    }

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
        `Failed to add the campaign click fields:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new Error(
        `Failed to add the campaign click fields for workspace ${workspaceId}`,
      );
    }
  }
}
