import { Command } from 'nest-commander';
import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.fields.name.universalIdentifier;
const SUBJECT_FIELD_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.fields.subject.universalIdentifier;
const NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.views.allMessageCampaigns.viewFields.name.universalIdentifier;
const SEARCHED_FIELD_UNIVERSAL_IDENTIFIERS = [
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
];

@RegisteredWorkspaceCommand('2.25.0', 1785229970000)
@Command({
  name: 'upgrade:2-25:add-message-campaign-name-field',
  description:
    'Add the internal name field to messageCampaign, surface it in the all campaigns view, index it in the search vector and make it the label identifier (was subject) on existing workspaces',
})
export class AddMessageCampaignNameFieldCommand extends ProvisionedWorkspaceCommandRunner {
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
      flatSearchFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatSearchFieldMetadataMaps',
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

    const fieldsToCreate: FlatFieldMetadata[] = [];

    if (
      !isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          NAME_FIELD_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      const standardNameField =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
          universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        });

      if (!isDefined(standardNameField)) {
        throw new Error(
          'Standard application is missing the messageCampaign name field',
        );
      }

      fieldsToCreate.push(standardNameField);
    }

    // Move the label identifier from subject to name, but never clobber a
    // user customization pointing at another field.
    const currentLabelIdentifier =
      campaignObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;
    const isNameLabelIdentifier =
      !isDefined(currentLabelIdentifier) ||
      currentLabelIdentifier === SUBJECT_FIELD_UNIVERSAL_IDENTIFIER ||
      currentLabelIdentifier === NAME_FIELD_UNIVERSAL_IDENTIFIER;
    const flatObjectMetadataToUpdate: FlatObjectMetadata[] =
      isNameLabelIdentifier &&
      currentLabelIdentifier !== NAME_FIELD_UNIVERSAL_IDENTIFIER
        ? [
            {
              ...campaignObjectMetadata,
              labelIdentifierFieldMetadataUniversalIdentifier:
                NAME_FIELD_UNIVERSAL_IDENTIFIER,
            },
          ]
        : [];

    const viewFieldsToCreate: FlatViewField[] = [];

    if (
      !isDefined(
        flatViewFieldMaps.byUniversalIdentifier[
          NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      const standardNameViewField =
        findFlatEntityByUniversalIdentifier<FlatViewField>({
          flatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
          universalIdentifier: NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        });

      if (!isDefined(standardNameViewField)) {
        throw new Error(
          'Standard application is missing the messageCampaign name view column',
        );
      }

      viewFieldsToCreate.push({
        ...standardNameViewField,
        position: this.computeNameViewFieldPosition({
          flatViewMaps,
          flatViewFieldMaps,
          standardNameViewField,
          isNameLabelIdentifier,
        }),
      });
    }

    const searchFieldMetadatasToCreate =
      this.computeSearchFieldMetadatasToCreate({
        flatSearchFieldMetadataMaps,
        standardFlatSearchFieldMetadataMaps:
          standardAllFlatEntityMaps.flatSearchFieldMetadataMaps,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
      });

    const totalOperationCount =
      fieldsToCreate.length +
      viewFieldsToCreate.length +
      searchFieldMetadatasToCreate.length +
      flatObjectMetadataToUpdate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `messageCampaign name field already configured for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewFieldsToCreate.length} view column(s), ${searchFieldMetadatasToCreate.length} search field(s), ${flatObjectMetadataToUpdate.length} label identifier update(s)`,
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
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatObjectMetadataToUpdate,
            },
            searchFieldMetadata: {
              flatEntityToCreate: searchFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add the messageCampaign name field:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add the messageCampaign name field for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added the messageCampaign name field for workspace ${workspaceId}`,
    );
  }

  // The standard positions assume a freshly provisioned view, where name comes
  // first and everything else is shifted by one. Existing views keep subject at
  // position 0, so name is placed relative to the columns already there: below
  // all of them when it becomes the label identifier (the validator requires
  // it), above all of them otherwise (the validator forbids anything below the
  // label identifier).
  private computeNameViewFieldPosition({
    flatViewMaps,
    flatViewFieldMaps,
    standardNameViewField,
    isNameLabelIdentifier,
  }: {
    flatViewMaps: FlatEntityMaps<FlatView>;
    flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
    standardNameViewField: FlatViewField;
    isNameLabelIdentifier: boolean;
  }): number {
    const flatView = findFlatEntityByUniversalIdentifier<FlatView>({
      flatEntityMaps: flatViewMaps,
      universalIdentifier: standardNameViewField.viewUniversalIdentifier,
    });

    if (!isDefined(flatView)) {
      return standardNameViewField.position;
    }

    const otherViewFieldPositions = flatView.viewFieldUniversalIdentifiers
      .map(
        (viewFieldUniversalIdentifier) =>
          flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier],
      )
      .filter(isDefined)
      .map(({ position }) => position);

    if (otherViewFieldPositions.length === 0) {
      return standardNameViewField.position;
    }

    return isNameLabelIdentifier
      ? Math.min(...otherViewFieldPositions) - 1
      : Math.max(...otherViewFieldPositions) + 1;
  }

  private computeSearchFieldMetadatasToCreate({
    flatSearchFieldMetadataMaps,
    standardFlatSearchFieldMetadataMaps,
    applicationUniversalIdentifier,
  }: {
    flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
    standardFlatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
    applicationUniversalIdentifier: string;
  }): FlatSearchFieldMetadata[] {
    return SEARCHED_FIELD_UNIVERSAL_IDENTIFIERS.flatMap(
      (fieldMetadataUniversalIdentifier) => {
        const searchFieldUniversalIdentifier =
          getSearchFieldUniversalIdentifier({
            applicationUniversalIdentifier,
            fieldMetadataUniversalIdentifier,
          });

        if (
          isDefined(
            flatSearchFieldMetadataMaps.byUniversalIdentifier[
              searchFieldUniversalIdentifier
            ],
          )
        ) {
          return [];
        }

        const standardFlatSearchFieldMetadata =
          findFlatEntityByUniversalIdentifier<FlatSearchFieldMetadata>({
            flatEntityMaps: standardFlatSearchFieldMetadataMaps,
            universalIdentifier: searchFieldUniversalIdentifier,
          });

        if (!isDefined(standardFlatSearchFieldMetadata)) {
          throw new Error(
            `Standard application is missing the messageCampaign search field for field ${fieldMetadataUniversalIdentifier}`,
          );
        }

        return [standardFlatSearchFieldMetadata];
      },
    );
  }
}
