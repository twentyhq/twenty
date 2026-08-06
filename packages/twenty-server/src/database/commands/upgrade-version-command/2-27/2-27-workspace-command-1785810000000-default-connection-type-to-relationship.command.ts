import { Command } from 'nest-commander';

import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findFlatFieldMetadataByName } from 'src/database/commands/upgrade-version-command/2-27/utils/find-flat-field-metadata-by-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CONNECTION_OBJECT_NAME_SINGULAR = 'connection';
const CONNECTION_TYPE_FIELD_NAME = 'connectionType';
const RELATIONSHIP_DEFAULT_VALUE = "'RELATIONSHIP'";

@RegisteredWorkspaceCommand('2.27.0', 1785810000000)
@Command({
  name: 'upgrade:2-27:default-connection-type-to-relationship',
  description:
    'Default connection.connectionType to RELATIONSHIP, so a connection made from a person record is classified as the two people knowing each other rather than landing with no type.',
})
export class DefaultConnectionTypeToRelationshipCommand extends ProvisionedWorkspaceCommandRunner {
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

    const connectionTypeFlatFieldMetadata = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: CONNECTION_OBJECT_NAME_SINGULAR,
      fieldName: CONNECTION_TYPE_FIELD_NAME,
    });

    if (!isDefined(connectionTypeFlatFieldMetadata)) {
      this.logger.log(
        `No connection.connectionType field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDefined(connectionTypeFlatFieldMetadata.defaultValue)) {
      this.logger.log(
        `connection.connectionType already has a default for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Defaulting connection.connectionType to RELATIONSHIP for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    // connection is a custom object, so the migration runs against the
    // workspace's custom application rather than the standard one
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const updatedConnectionTypeField: FlatFieldMetadata<FieldMetadataType.SELECT> =
      {
        ...(connectionTypeFlatFieldMetadata as FlatFieldMetadata<FieldMetadataType.SELECT>),
        defaultValue: RELATIONSHIP_DEFAULT_VALUE,
        updatedAt: new Date().toISOString(),
      };

    const result =
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
              flatEntityToUpdate: [updatedConnectionTypeField],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to default connection.connectionType for workspace ${workspaceId}: ${JSON.stringify(
          result,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Defaulted connection.connectionType to RELATIONSHIP for workspace ${workspaceId}`,
    );
  }
}
