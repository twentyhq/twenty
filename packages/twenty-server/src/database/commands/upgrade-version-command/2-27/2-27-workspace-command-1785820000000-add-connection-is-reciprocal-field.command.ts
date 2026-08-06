import { Command } from 'nest-commander';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findFlatFieldMetadataByName } from 'src/database/commands/upgrade-version-command/2-27/utils/find-flat-field-metadata-by-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { fromCreateFieldInputToFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadatas-to-create.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CONNECTION_OBJECT_NAME_SINGULAR = 'connection';
const IS_RECIPROCAL_FIELD_NAME = 'isReciprocal';

@RegisteredWorkspaceCommand('2.27.0', 1785820000000)
@Command({
  name: 'upgrade:2-27:add-connection-is-reciprocal-field',
  description:
    'Add connection.isReciprocal, which marks the generated reverse of a connection so a person record can show both directions in one field while the connections list keeps showing each relationship once.',
})
export class AddConnectionIsReciprocalFieldCommand extends ProvisionedWorkspaceCommandRunner {
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

    const connectionFlatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find(
      (candidate) =>
        candidate?.nameSingular === CONNECTION_OBJECT_NAME_SINGULAR,
    );

    if (!isDefined(connectionFlatObjectMetadata)) {
      this.logger.log(
        `No connection object for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingIsReciprocalField = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: CONNECTION_OBJECT_NAME_SINGULAR,
      fieldName: IS_RECIPROCAL_FIELD_NAME,
    });

    if (isDefined(existingIsReciprocalField)) {
      this.logger.log(
        `connection.isReciprocal already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Adding connection.isReciprocal for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    // connection is a custom object, so its fields belong to the workspace
    // custom application rather than the standard one
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const transpilationResult =
      await fromCreateFieldInputToFlatFieldMetadatasToCreate({
        createFieldInput: {
          objectMetadataId: connectionFlatObjectMetadata.id,
          name: IS_RECIPROCAL_FIELD_NAME,
          label: 'Reciprocal',
          description:
            'Set on the automatically generated reverse of a connection. Reciprocals are hidden from the connections list.',
          type: FieldMetadataType.BOOLEAN,
          defaultValue: false,
          icon: 'IconArrowsExchange',
        },
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatApplication: workspaceCustomFlatApplication,
      });

    if (transpilationResult.status === 'fail') {
      throw new Error(
        `Failed to build connection.isReciprocal for workspace ${workspaceId}: ${JSON.stringify(
          transpilationResult.errors,
          null,
          2,
        )}`,
      );
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate:
                transpilationResult.result.flatFieldMetadatas,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            index: {
              flatEntityToCreate: transpilationResult.result.indexMetadatas,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to add connection.isReciprocal for workspace ${workspaceId}: ${JSON.stringify(
          result,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Added connection.isReciprocal for workspace ${workspaceId}`,
    );
  }
}
