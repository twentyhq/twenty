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
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const COMPANY = STANDARD_OBJECTS.company;

const SHORT_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  COMPANY.fields.shortName.universalIdentifier;

// Existing workspaces keep their column order, so the new column is slotted
// next to an anchor column instead of shifting every standard position.
const SHORT_NAME_VIEW_FIELD_PLACEMENTS = [
  {
    universalIdentifier:
      COMPANY.views.allCompanies.viewFields.shortName.universalIdentifier,
    anchorUniversalIdentifier:
      COMPANY.views.allCompanies.viewFields.name.universalIdentifier,
    positionOffsetFromAnchor: 0.5,
  },
  {
    universalIdentifier:
      COMPANY.views.companyRecordPageFields.viewFields.shortName
        .universalIdentifier,
    anchorUniversalIdentifier:
      COMPANY.views.companyRecordPageFields.viewFields.domainName
        .universalIdentifier,
    positionOffsetFromAnchor: -0.5,
  },
];

@RegisteredWorkspaceCommand('2.51.0', 1793215271349)
@Command({
  name: 'upgrade:2-51:add-company-short-name',
  description:
    'Add the shortName field to company and surface it in the all companies view and the record page',
})
export class AddCompanyShortNameCommand extends ProvisionedWorkspaceCommandRunner {
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
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
    ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          COMPANY.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `company object does not exist for workspace ${workspaceId}, skipping`,
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

    const fieldsToCreate = getStandardFlatEntitiesToCreateOrThrow<
      FlatFieldMetadata
    >({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
      existingFlatEntityMaps: flatFieldMetadataMaps,
      universalIdentifiers: [SHORT_NAME_FIELD_UNIVERSAL_IDENTIFIER],
    });

    const viewFieldsToCreate = getStandardFlatEntitiesToCreateOrThrow<
      FlatViewField
    >({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
      existingFlatEntityMaps: flatViewFieldMaps,
      universalIdentifiers: SHORT_NAME_VIEW_FIELD_PLACEMENTS.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    })
      .filter(({ viewUniversalIdentifier }) =>
        isDefined(flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]),
      )
      .map((viewField) => {
        const placement = SHORT_NAME_VIEW_FIELD_PLACEMENTS.find(
          ({ universalIdentifier }) =>
            universalIdentifier === viewField.universalIdentifier,
        );

        const anchorViewField = isDefined(placement)
          ? flatViewFieldMaps.byUniversalIdentifier[
              placement.anchorUniversalIdentifier
            ]
          : undefined;

        if (!isDefined(placement) || !isDefined(anchorViewField)) {
          return viewField;
        }

        return {
          ...viewField,
          position:
            anchorViewField.position + placement.positionOffsetFromAnchor,
        };
      });

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewFieldsToCreate.length} view field(s)`,
      );

      return;
    }

    if (fieldsToCreate.length === 0 && viewFieldsToCreate.length === 0) {
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
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add the company shortName field:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add the company shortName field for workspace ${workspaceId}`,
      );
    }
  }
}
