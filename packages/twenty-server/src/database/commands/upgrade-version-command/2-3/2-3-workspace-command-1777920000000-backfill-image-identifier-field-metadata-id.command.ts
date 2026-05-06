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
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_MEMBER_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.universalIdentifier;

const AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.fields.avatarUrl.universalIdentifier;

@RegisteredWorkspaceCommand('2.3.0', 1777920000000)
@Command({
  name: 'upgrade:2-3:backfill-image-identifier-field-metadata-id',
  description:
    'Backfill imageIdentifierFieldMetadataId on workspaceMember for workspaces where it was never set.',
})
export class BackfillImageIdentifierFieldMetadataIdCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const existingObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: WORKSPACE_MEMBER_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(existingObject)) {
      this.logger.log(
        `workspaceMember object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (
      existingObject.imageIdentifierFieldMetadataUniversalIdentifier ===
      AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER
    ) {
      this.logger.log(
        `imageIdentifierFieldMetadataId already set for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(existingField)) {
      this.logger.log(
        `avatarUrl field not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill imageIdentifierFieldMetadataId on workspaceMember for workspace ${workspaceId}`,
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
              flatEntityToUpdate: [
                {
                  ...existingObject,
                  imageIdentifierFieldMetadataUniversalIdentifier:
                    AVATAR_URL_FIELD_UNIVERSAL_IDENTIFIER,
                },
              ],
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
      `Backfilled imageIdentifierFieldMetadataId on workspaceMember for workspace ${workspaceId}`,
    );
  }
}
