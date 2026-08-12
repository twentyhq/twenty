import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TARGET_OBJECT_NAME_SINGULARS = [
  'recruitment',
  'fellowship',
  'mentorship',
  'jobCandidacy',
  'fundraisingOpportunity',
];

// Only types backed by a single scalar column, where NOT NULL without a
// database default makes the create-then-edit record creation flow fail.
const COLUMN_BACKED_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.RATING,
];

@RegisteredWorkspaceCommand('2.32.0', 1786900000000)
@Command({
  name: 'upgrade:2-32:make-required-fields-without-defaults-optional',
  description:
    'Make custom fields that are non-nullable without a default value nullable, so record creation stops failing on recruitment, fellowship, mentorship, jobCandidacy and fundraisingOpportunity',
})
export class MakeRequiredFieldsWithoutDefaultsOptionalCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const targetObjectMetadataIds = new Set(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter((flatObjectMetadata) =>
          TARGET_OBJECT_NAME_SINGULARS.includes(
            flatObjectMetadata.nameSingular,
          ),
        )
        .map((flatObjectMetadata) => flatObjectMetadata.id),
    );

    if (targetObjectMetadataIds.size === 0) {
      this.logger.log(
        `None of the target objects exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const flatFieldMetadatasToFix = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          targetObjectMetadataIds.has(flatFieldMetadata.objectMetadataId) &&
          flatFieldMetadata.isNullable === false &&
          !isDefined(flatFieldMetadata.defaultValue) &&
          flatFieldMetadata.isActive &&
          !flatFieldMetadata.isSystem &&
          COLUMN_BACKED_FIELD_TYPES.includes(flatFieldMetadata.type),
      );

    if (flatFieldMetadatasToFix.length === 0) {
      this.logger.log(
        `No non-nullable fields without defaults found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const fieldNamesToFix = flatFieldMetadatasToFix
      .map((flatFieldMetadata) => flatFieldMetadata.name)
      .join(', ');

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Making ${flatFieldMetadatasToFix.length} fields nullable for workspace ${workspaceId}: ${fieldNamesToFix}`,
    );

    if (isDryRun) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const updatedFlatFieldMetadatas: FlatFieldMetadata[] =
      flatFieldMetadatasToFix.map((flatFieldMetadata) => ({
        ...flatFieldMetadata,
        isNullable: true,
        updatedAt: new Date().toISOString(),
      }));

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: updatedFlatFieldMetadatas,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to make fields nullable for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Made ${updatedFlatFieldMetadatas.length} fields nullable for workspace ${workspaceId}`,
    );
  }
}
