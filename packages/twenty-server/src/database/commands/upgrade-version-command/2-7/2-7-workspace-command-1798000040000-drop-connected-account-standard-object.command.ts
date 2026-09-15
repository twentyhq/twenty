import { Command } from 'nest-commander';

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

const CONNECTED_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-977e-46b2-890b-c3002ddfd5c5';

const WORKSPACE_MEMBER_CONNECTED_ACCOUNTS_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-e322-4bde-a525-727079b4a100';

const MESSAGE_CHANNEL_CONNECTED_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-49a2-44a4-b470-282c0440d15d';

const CALENDAR_CHANNEL_CONNECTED_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-95b1-4f44-82dc-61b042ae2414';

@RegisteredWorkspaceCommand('2.7.0', 1798000040000)
@Command({
  name: 'upgrade:2-7:drop-connected-account-standard-object',
  description:
    'Drop the connectedAccount standard object from workspace schemas (moved to core metadata)',
})
export class DropConnectedAccountStandardObjectCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting connectedAccount standard object removal for workspace ${workspaceId}`,
    );

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const connectedAccountObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: CONNECTED_ACCOUNT_OBJECT_UNIVERSAL_IDENTIFIER,
      });

    const relationFieldsToDelete = [
      WORKSPACE_MEMBER_CONNECTED_ACCOUNTS_FIELD_UNIVERSAL_IDENTIFIER,
      MESSAGE_CHANNEL_CONNECTED_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      CALENDAR_CHANNEL_CONNECTED_ACCOUNT_FIELD_UNIVERSAL_IDENTIFIER,
    ]
      .map((universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
      )
      .filter((field): field is FlatFieldMetadata => field !== undefined);

    if (
      !connectedAccountObjectMetadata &&
      relationFieldsToDelete.length === 0
    ) {
      this.logger.log(
        `connectedAccount standard object already absent for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete connectedAccount standard object and ${relationFieldsToDelete.length} relation fields for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            ...(connectedAccountObjectMetadata
              ? {
                  objectMetadata: {
                    flatEntityToCreate: [],
                    flatEntityToDelete: [connectedAccountObjectMetadata],
                    flatEntityToUpdate: [],
                  },
                }
              : {}),
            ...(relationFieldsToDelete.length > 0
              ? {
                  fieldMetadata: {
                    flatEntityToCreate: [],
                    flatEntityToDelete: relationFieldsToDelete,
                    flatEntityToUpdate: [],
                  },
                }
              : {}),
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to delete connectedAccount standard object:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to delete connectedAccount standard object for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Deleted connectedAccount standard object and relation fields for workspace ${workspaceId}`,
    );
  }
}
