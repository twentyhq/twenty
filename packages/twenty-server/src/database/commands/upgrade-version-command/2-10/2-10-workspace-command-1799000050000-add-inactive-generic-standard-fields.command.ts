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
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const NEW_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.company.fields.annualRevenue.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.10.0', 1799000050000)
@Command({
  name: 'upgrade:2-10:add-inactive-generic-standard-fields',
  description:
    'Create the new generic standard field (Company annualRevenue) on existing workspaces as inactive (opt-in), with its column ready for activation',
})
export class AddInactiveGenericStandardFieldsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const takenFieldNamesByObject = new Map<string, Set<string>>();

    for (const existingFlatFieldMetadata of Object.values(
      existingFlatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      const takenFieldNames =
        takenFieldNamesByObject.get(
          existingFlatFieldMetadata.objectMetadataUniversalIdentifier,
        ) ?? new Set<string>();

      takenFieldNames.add(existingFlatFieldMetadata.name);
      takenFieldNamesByObject.set(
        existingFlatFieldMetadata.objectMetadataUniversalIdentifier,
        takenFieldNames,
      );
    }

    const fieldsToCreate: FlatFieldMetadata[] = [];

    for (const universalIdentifier of NEW_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS) {
      const standardFlatFieldMetadata =
        standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          universalIdentifier
        ];

      if (!isDefined(standardFlatFieldMetadata)) {
        continue;
      }

      const fieldAlreadyExists = isDefined(
        existingFlatFieldMetadataMaps.byUniversalIdentifier[
          standardFlatFieldMetadata.universalIdentifier
        ],
      );

      if (fieldAlreadyExists) {
        continue;
      }

      const targetObjectExists = isDefined(
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            standardFlatFieldMetadata.objectMetadataUniversalIdentifier,
        }),
      );

      if (!targetObjectExists) {
        continue;
      }

      const fieldNameIsTaken =
        takenFieldNamesByObject
          .get(standardFlatFieldMetadata.objectMetadataUniversalIdentifier)
          ?.has(standardFlatFieldMetadata.name) === true;

      if (fieldNameIsTaken) {
        this.logger.warn(
          `Field name "${standardFlatFieldMetadata.name}" is already taken on its object for workspace ${workspaceId}; skipping (run upgrade:2-10:rename-conflicting-custom-fields first)`,
        );

        continue;
      }

      fieldsToCreate.push({
        ...standardFlatFieldMetadata,
        isActive: false,
        viewFieldIds: [],
        viewFieldUniversalIdentifiers: [],
      });
    }

    if (fieldsToCreate.length === 0) {
      this.logger.log(
        `All new generic standard fields already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Creating ${fieldsToCreate.length} inactive standard field(s) for workspace ${workspaceId}: ${fieldsToCreate.map(({ name }) => name).join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to create inactive generic standard fields:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to create inactive generic standard fields for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully created ${fieldsToCreate.length} inactive standard field(s) for workspace ${workspaceId}`,
    );
  }
}
