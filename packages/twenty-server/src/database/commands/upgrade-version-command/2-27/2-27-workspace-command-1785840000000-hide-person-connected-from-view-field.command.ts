import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findFlatFieldMetadataByName } from 'src/database/commands/upgrade-version-command/2-27/utils/find-flat-field-metadata-by-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const PERSON_OBJECT_NAME_SINGULAR = 'person';
const CONNECTED_FROM_FIELD_NAME = 'connectedFrom';
const CONNECTION_OBJECT_NAME_SINGULAR = 'connection';
const IS_RECIPROCAL_FIELD_NAME = 'isReciprocal';

@RegisteredWorkspaceCommand('2.27.0', 1785840000000)
@Command({
  name: 'upgrade:2-27:hide-person-connected-from-view-field',
  description:
    'Hide the Connected From column wherever a person record page shows it. Once every connection is stored in both directions, Connections lists all of them and Connected From only repeats the same records.',
})
export class HidePersonConnectedFromViewFieldCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatViewFieldMaps',
      ]);

    // Only workspaces whose connections are kept symmetric should lose the
    // second field, otherwise hiding it would hide records nothing else shows
    const isReciprocalFlatFieldMetadata = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: CONNECTION_OBJECT_NAME_SINGULAR,
      fieldName: IS_RECIPROCAL_FIELD_NAME,
    });

    if (!isDefined(isReciprocalFlatFieldMetadata)) {
      this.logger.log(
        `No connection.isReciprocal field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const connectedFromFlatFieldMetadata = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: PERSON_OBJECT_NAME_SINGULAR,
      fieldName: CONNECTED_FROM_FIELD_NAME,
    });

    if (!isDefined(connectedFromFlatFieldMetadata)) {
      this.logger.log(
        `No person.connectedFrom field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const viewFieldsToHide = Object.values(flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatViewField) =>
          flatViewField.fieldMetadataId === connectedFromFlatFieldMetadata.id &&
          flatViewField.isVisible,
      )
      .map<FlatViewField>((flatViewField) => ({
        ...flatViewField,
        isVisible: false,
        updatedAt: new Date().toISOString(),
      }));

    if (viewFieldsToHide.length === 0) {
      this.logger.log(
        `person.connectedFrom already hidden for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Hiding person.connectedFrom in ${viewFieldsToHide.length} view(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: viewFieldsToHide,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to hide person.connectedFrom for workspace ${workspaceId}: ${JSON.stringify(
          result,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Hid person.connectedFrom in ${viewFieldsToHide.length} view(s) for workspace ${workspaceId}`,
    );
  }
}
