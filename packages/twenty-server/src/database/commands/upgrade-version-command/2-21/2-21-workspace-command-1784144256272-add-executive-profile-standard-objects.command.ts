import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const getUniversalIdentifiers = <
  T extends Record<string, { universalIdentifier: string }>,
>(
  entitiesByName: T,
): string[] =>
  Object.values(entitiesByName).map((entity) => entity.universalIdentifier);

const EXECUTIVE_PROFILE_UID = STANDARD_OBJECTS.executiveProfile.universalIdentifier;
const EXECUTIVE_CAREER_EXPERIENCE_UID =
  STANDARD_OBJECTS.executiveCareerExperience.universalIdentifier;
const EXECUTIVE_EDUCATION_UID =
  STANDARD_OBJECTS.executiveEducation.universalIdentifier;
const EXECUTIVE_BOARD_SERVICE_UID =
  STANDARD_OBJECTS.executiveBoardService.universalIdentifier;
const EXECUTIVE_CAPABILITY_UID =
  STANDARD_OBJECTS.executiveCapability.universalIdentifier;
const EXECUTIVE_LANGUAGE_UID =
  STANDARD_OBJECTS.executiveLanguage.universalIdentifier;
const EXECUTIVE_ARTIFACT_UID =
  STANDARD_OBJECTS.executiveArtifact.universalIdentifier;
const EXECUTIVE_AWARD_UID =
  STANDARD_OBJECTS.executiveAward.universalIdentifier;
const EXECUTIVE_EXTERNAL_PROFILE_UID =
  STANDARD_OBJECTS.executiveExternalProfile.universalIdentifier;
const EXECUTIVE_SEARCH_PREFERENCE_UID =
  STANDARD_OBJECTS.executiveSearchPreference.universalIdentifier;

const EXECUTIVE_OBJECT_UNIVERSAL_IDENTIFIERS = [
  EXECUTIVE_PROFILE_UID,
  EXECUTIVE_CAREER_EXPERIENCE_UID,
  EXECUTIVE_EDUCATION_UID,
  EXECUTIVE_BOARD_SERVICE_UID,
  EXECUTIVE_CAPABILITY_UID,
  EXECUTIVE_LANGUAGE_UID,
  EXECUTIVE_ARTIFACT_UID,
  EXECUTIVE_AWARD_UID,
  EXECUTIVE_EXTERNAL_PROFILE_UID,
  EXECUTIVE_SEARCH_PREFERENCE_UID,
];

const EXECUTIVE_FIELD_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveProfile.fields),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.executiveCareerExperience.fields,
  ),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveEducation.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveBoardService.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveCapability.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveLanguage.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveArtifact.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveAward.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveExternalProfile.fields),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.executiveSearchPreference.fields,
  ),
];

const EXECUTIVE_INDEX_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveProfile.indexes),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.executiveCareerExperience.indexes,
  ),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveEducation.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveBoardService.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveCapability.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveLanguage.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveArtifact.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveAward.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.executiveExternalProfile.indexes),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.executiveSearchPreference.indexes,
  ),
];

const buildViewUniversalIdentifiers = (
  views:
    | typeof STANDARD_OBJECTS.executiveProfile.views
    | typeof STANDARD_OBJECTS.executiveCareerExperience.views
    | typeof STANDARD_OBJECTS.executiveEducation.views
    | typeof STANDARD_OBJECTS.executiveBoardService.views
    | typeof STANDARD_OBJECTS.executiveCapability.views
    | typeof STANDARD_OBJECTS.executiveLanguage.views
    | typeof STANDARD_OBJECTS.executiveArtifact.views
    | typeof STANDARD_OBJECTS.executiveAward.views
    | typeof STANDARD_OBJECTS.executiveExternalProfile.views
    | typeof STANDARD_OBJECTS.executiveSearchPreference.views,
): { viewUids: string[]; viewFieldUids: string[] } => {
  const viewUids: string[] = [];
  const viewFieldUids: string[] = [];

  for (const viewDef of Object.values(views)) {
    viewUids.push(viewDef.universalIdentifier);
    viewFieldUids.push(...getUniversalIdentifiers(viewDef.viewFields));
  }

  return { viewUids, viewFieldUids };
};

// Combine all executive object view/viewField UIDs
const EXECUTIVE_ALL_VIEW_UNIVERSAL_IDENTIFIERS = [
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveProfile.views)
    .viewUids,
  ...buildViewUniversalIdentifiers(
    STANDARD_OBJECTS.executiveCareerExperience.views,
  ).viewUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveEducation.views)
    .viewUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveBoardService.views)
    .viewUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveCapability.views)
    .viewUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveLanguage.views)
    .viewUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveArtifact.views)
    .viewUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveAward.views)
    .viewUids,
  ...buildViewUniversalIdentifiers(
    STANDARD_OBJECTS.executiveExternalProfile.views,
  ).viewUids,
  ...buildViewUniversalIdentifiers(
    STANDARD_OBJECTS.executiveSearchPreference.views,
  ).viewUids,
];
const EXECUTIVE_ALL_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveProfile.views)
    .viewFieldUids,
  ...buildViewUniversalIdentifiers(
    STANDARD_OBJECTS.executiveCareerExperience.views,
  ).viewFieldUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveEducation.views)
    .viewFieldUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveBoardService.views)
    .viewFieldUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveCapability.views)
    .viewFieldUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveLanguage.views)
    .viewFieldUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveArtifact.views)
    .viewFieldUids,
  ...buildViewUniversalIdentifiers(STANDARD_OBJECTS.executiveAward.views)
    .viewFieldUids,
  ...buildViewUniversalIdentifiers(
    STANDARD_OBJECTS.executiveExternalProfile.views,
  ).viewFieldUids,
  ...buildViewUniversalIdentifiers(
    STANDARD_OBJECTS.executiveSearchPreference.views,
  ).viewFieldUids,
];

@RegisteredWorkspaceCommand('2.21.0', 1784144256272)
@Command({
  name: 'upgrade:2-21:add-executive-profile-standard-objects',
  description:
    'Add the 10 executive-profile standard objects (executiveProfile, executiveCareerExperience, executiveEducation, executiveBoardService, executiveCapability, executiveLanguage, executiveArtifact, executiveAward, executiveExternalProfile, executiveSearchPreference) to existing workspaces',
})
export class AddExecutiveProfileStandardObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    this.logger.log(
      `Checking executive-profile standard objects for workspace ${workspaceId}`,
    );

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatViewMaps,
      flatViewFieldMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

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

    const objectMetadataToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatObjectMetadataMaps,
        existingFlatEntityMaps: flatObjectMetadataMaps,
        universalIdentifiers: EXECUTIVE_OBJECT_UNIVERSAL_IDENTIFIERS,
      });

    if (objectMetadataToCreate.length === 0) {
      this.logger.log(
        `Executive-profile standard objects already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const allFlatEntityOperationByMetadataName = {
      objectMetadata: {
        flatEntityToCreate: objectMetadataToCreate,
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      fieldMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers: EXECUTIVE_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers: EXECUTIVE_INDEX_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      view: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatView>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
            existingFlatEntityMaps: flatViewMaps,
            universalIdentifiers: EXECUTIVE_ALL_VIEW_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      viewField: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatViewFieldMaps,
            existingFlatEntityMaps: flatViewFieldMaps,
            universalIdentifiers:
              EXECUTIVE_ALL_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
    };

    const totalCreateCount = Object.values(
      allFlatEntityOperationByMetadataName,
    ).reduce(
      (total, operations) => total + operations.flatEntityToCreate.length,
      0,
    );

    if (totalCreateCount === 0) {
      this.logger.log(
        `Executive-profile standard objects already fully exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${totalCreateCount} executive-profile standard metadata entities (${objectMetadataToCreate.length} objects, ${allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate.length} fields, ${allFlatEntityOperationByMetadataName.index.flatEntityToCreate.length} indexes, ${allFlatEntityOperationByMetadataName.view.flatEntityToCreate.length} views, ${allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate.length} view fields) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to create executive-profile standard objects:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to create executive-profile standard objects for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully created ${totalCreateCount} executive-profile standard metadata entities for workspace ${workspaceId}`,
    );
  }
}
