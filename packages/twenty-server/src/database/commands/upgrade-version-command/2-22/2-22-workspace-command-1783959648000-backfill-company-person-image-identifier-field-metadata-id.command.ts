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
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const IMAGE_IDENTIFIER_BACKFILL_TARGETS = [
  {
    objectNameForLog: 'company',
    objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
    fieldNameForLog: 'domainName',
    fieldUniversalIdentifier:
      STANDARD_OBJECTS.company.fields.domainName.universalIdentifier,
    deprecatedFieldUniversalIdentifier: undefined,
  },
  {
    objectNameForLog: 'person',
    objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
    fieldNameForLog: 'avatarFile',
    fieldUniversalIdentifier:
      STANDARD_OBJECTS.person.fields.avatarFile.universalIdentifier,
    deprecatedFieldUniversalIdentifier:
      STANDARD_OBJECTS.person.fields.avatarUrl.universalIdentifier,
  },
] as const;

@RegisteredWorkspaceCommand('2.22.0', 1783959648000)
@Command({
  name: 'upgrade:2-22:backfill-company-person-image-identifier-field-metadata-id',
  description:
    'Backfill imageIdentifierFieldMetadataId on company (domainName) and person (avatarFile) for existing workspaces.',
})
export class BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const flatObjectMetadataToUpdate: FlatObjectMetadata[] = [];

    for (const target of IMAGE_IDENTIFIER_BACKFILL_TARGETS) {
      const existingObject =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: target.objectUniversalIdentifier,
        });

      if (!isDefined(existingObject)) {
        this.logger.log(
          `${target.objectNameForLog} object not found for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      const currentIdentifier =
        existingObject.imageIdentifierFieldMetadataUniversalIdentifier;

      // Backfill when unset, or when it still points to the deprecated field
      // (e.g. person.avatarUrl). Never clobber a real user customization.
      const isBackfillable =
        !isDefined(currentIdentifier) ||
        currentIdentifier === target.deprecatedFieldUniversalIdentifier;

      if (!isBackfillable) {
        this.logger.log(
          `imageIdentifierFieldMetadataId already set on ${target.objectNameForLog} for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      const existingField =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: target.fieldUniversalIdentifier,
        });

      if (!isDefined(existingField)) {
        this.logger.log(
          `${target.fieldNameForLog} field not found on ${target.objectNameForLog} for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      flatObjectMetadataToUpdate.push({
        ...existingObject,
        imageIdentifierFieldMetadataUniversalIdentifier:
          target.fieldUniversalIdentifier,
      });
    }

    if (flatObjectMetadataToUpdate.length === 0) {
      this.logger.log(
        `Nothing to backfill for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill imageIdentifierFieldMetadataId on ${flatObjectMetadataToUpdate
          .map((flatObjectMetadata) => flatObjectMetadata.nameSingular)
          .join(', ')} for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatObjectMetadataToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill imageIdentifierFieldMetadataId for workspace ${workspaceId}:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill imageIdentifierFieldMetadataId for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Backfilled imageIdentifierFieldMetadataId on ${flatObjectMetadataToUpdate
        .map((flatObjectMetadata) => flatObjectMetadata.nameSingular)
        .join(', ')} for workspace ${workspaceId}`,
    );
  }
}
