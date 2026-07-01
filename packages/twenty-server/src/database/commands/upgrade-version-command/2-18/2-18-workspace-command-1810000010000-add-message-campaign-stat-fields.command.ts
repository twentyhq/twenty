import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const STAT_FIELD_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.fields.sentCount.universalIdentifier,
  CAMPAIGN.fields.failedCount.universalIdentifier,
  CAMPAIGN.fields.bouncedCount.universalIdentifier,
  CAMPAIGN.fields.complainedCount.universalIdentifier,
];

const STAT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.views.allMessageCampaigns.viewFields.sentCount.universalIdentifier,
  CAMPAIGN.views.allMessageCampaigns.viewFields.failedCount.universalIdentifier,
  CAMPAIGN.views.allMessageCampaigns.viewFields.bouncedCount.universalIdentifier,
  CAMPAIGN.views.allMessageCampaigns.viewFields.complainedCount
    .universalIdentifier,
];

const BODY_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.fields.bodyTemplate.universalIdentifier;

@RegisteredWorkspaceCommand('2.18.0', 1810000010000)
@Command({
  name: 'upgrade:2-18:add-message-campaign-stat-fields',
  description:
    'Add the MessageCampaign delivery-stat fields (sent/failed/bounced/complained), their view columns, render the body as HTML, and backfill counts on existing workspaces',
})
export class AddMessageCampaignStatFieldsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly messageCampaignService: MessageCampaignService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
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

    const viewFieldsToCreate = STAT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.filter(
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

    const bodyTemplateUpdate = this.buildBodyTemplateHtmlUpdate(
      flatFieldMetadataMaps,
    );

    const hasMetadataChanges =
      fieldsToCreate.length > 0 ||
      viewFieldsToCreate.length > 0 ||
      isDefined(bodyTemplateUpdate);

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewFieldsToCreate.length} view column(s), body-as-html=${isDefined(bodyTemplateUpdate)}, then backfill campaign counts`,
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
                flatEntityToUpdate: isDefined(bodyTemplateUpdate)
                  ? [bodyTemplateUpdate]
                  : [],
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

    await this.messageCampaignService.refreshAllCampaignCounts(workspaceId);

    this.logger.log(
      `Applied messageCampaign stat fields and backfilled counts for workspace ${workspaceId}`,
    );
  }

  private buildBodyTemplateHtmlUpdate(
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): FlatFieldMetadata | null {
    const bodyTemplate =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: BODY_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (
      !isDefined(bodyTemplate) ||
      (bodyTemplate.settings as { renderAsHtml?: boolean } | null)
        ?.renderAsHtml === true
    ) {
      return null;
    }

    return {
      ...bodyTemplate,
      settings: {
        ...(bodyTemplate.settings ?? {}),
        renderAsHtml: true,
      },
    };
  }
}
