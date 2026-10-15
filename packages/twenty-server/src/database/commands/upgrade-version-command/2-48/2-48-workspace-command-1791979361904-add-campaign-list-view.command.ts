import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.views.allMessageCampaigns.universalIdentifier;

const LIST_VIEW_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.views.messageCampaignList.universalIdentifier;

const LIST_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  CAMPAIGN.views.messageCampaignList.viewFields,
).map((viewField) => viewField.universalIdentifier);

@RegisteredWorkspaceCommand('2.48.0', 1791979361904)
@Command({
  name: 'upgrade:2-48:add-campaign-list-view',
  description:
    'Turn the campaigns INDEX view back into a table and add the standard campaigns list view on top of it in existing workspaces',
})
export class AddCampaignListViewCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

    const hasCampaignObject = isDefined(
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: CAMPAIGN.universalIdentifier,
      }),
    );

    if (!hasCampaignObject) {
      this.logger.log(
        `Campaign object does not exist for workspace ${workspaceId}, skipping`,
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

    const indexView = findFlatEntityByUniversalIdentifier<FlatView>({
      flatEntityMaps: flatViewMaps,
      universalIdentifier: INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    });

    const viewsToUpdate =
      isDefined(indexView) && indexView.type !== ViewType.TABLE
        ? [{ ...indexView, type: ViewType.TABLE }]
        : [];

    const viewsToCreate = getStandardFlatEntitiesToCreateOrThrow<FlatView>({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
      existingFlatEntityMaps: flatViewMaps,
      universalIdentifiers: [LIST_VIEW_UNIVERSAL_IDENTIFIER],
    });

    const viewFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers: LIST_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      }).filter((standardViewField) => {
        const fieldUniversalIdentifier =
          standardAllFlatEntityMaps.flatFieldMetadataMaps
            .universalIdentifierById[standardViewField.fieldMetadataId];

        return (
          isDefined(fieldUniversalIdentifier) &&
          isDefined(
            flatFieldMetadataMaps.byUniversalIdentifier[
              fieldUniversalIdentifier
            ],
          )
        );
      });

    if (
      viewsToUpdate.length === 0 &&
      viewsToCreate.length === 0 &&
      viewFieldsToCreate.length === 0
    ) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${viewsToUpdate.length} INDEX view(s) back to table, ${viewsToCreate.length} list view(s), ${viewFieldsToCreate.length} list view column(s)`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: viewsToUpdate,
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
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add the campaign list view for workspace ${workspaceId}`,
      );
    }
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
      ]);

    const viewsToDelete = [
      findFlatEntityByUniversalIdentifier<FlatView>({
        flatEntityMaps: flatViewMaps,
        universalIdentifier: LIST_VIEW_UNIVERSAL_IDENTIFIER,
      }),
    ].filter(isDefined);

    const viewFieldsToDelete = LIST_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatViewField>({
          flatEntityMaps: flatViewFieldMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);

    if (viewsToDelete.length === 0 && viewFieldsToDelete.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would remove ${viewsToDelete.length} list view(s), ${viewFieldsToDelete.length} list view column(s)`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to remove the campaign list view for workspace ${workspaceId}`,
      );
    }
  }
}
