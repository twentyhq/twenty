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
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const CLICKED_COUNT_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.fields.clickedCount.universalIdentifier;

const CLICKED_COUNT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.views.allMessageCampaigns.viewFields.clickedCount
    .universalIdentifier,
  CAMPAIGN.views.messageCampaignRecordPageFields.viewFields.clickedCount
    .universalIdentifier,
];

@RegisteredWorkspaceCommand('2.40.0', 1788865945541)
@Command({
  name: 'upgrade:2-40:add-message-campaign-clicked-count',
  description:
    'Add the MessageCampaign clickedCount field and its view columns on existing workspaces',
})
export class AddMessageCampaignClickedCountCommand extends ProvisionedWorkspaceCommandRunner {
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

    const fieldsToCreate = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        CLICKED_COUNT_UNIVERSAL_IDENTIFIER
      ],
    )
      ? []
      : [
          this.findStandardFieldOrThrow({
            standardAllFlatEntityMaps,
            universalIdentifier: CLICKED_COUNT_UNIVERSAL_IDENTIFIER,
          }),
        ];

    const viewFieldsToCreate =
      CLICKED_COUNT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.filter(
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

        return isDefined(standardViewField) ? [standardViewField] : [];
      });

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewFieldsToCreate.length} view column(s)`,
      );

      return;
    }

    if (fieldsToCreate.length === 0 && viewFieldsToCreate.length === 0) {
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
        `Failed to add messageCampaign clickedCount:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add messageCampaign clickedCount for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Applied messageCampaign clickedCount for workspace ${workspaceId}`,
    );
  }

  private findStandardFieldOrThrow({
    standardAllFlatEntityMaps,
    universalIdentifier,
  }: {
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
    universalIdentifier: string;
  }): FlatFieldMetadata {
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
  }
}
