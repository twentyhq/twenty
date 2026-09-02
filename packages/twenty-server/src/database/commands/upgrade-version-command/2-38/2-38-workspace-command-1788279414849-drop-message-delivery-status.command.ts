import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Kept as a literal because the entry it used to name has been removed from
// STANDARD_OBJECT_FIELDS in the same change.
const MESSAGE_DELIVERY_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '209254fa-2b89-429d-a72a-c401c4bd5a78';

@RegisteredWorkspaceCommand('2.38.0', 1788279414849)
@Command({
  name: 'upgrade:2-38:drop-message-delivery-status',
  description:
    'Remove the message deliveryStatus field, now that per-recipient campaign state lives on core.campaignDelivery',
})
export class DropMessageDeliveryStatusCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const deliveryStatusField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          MESSAGE_DELIVERY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(deliveryStatusField)) {
      this.logger.log(
        `Workspace ${workspaceId} has no message deliveryStatus field, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would drop the message deliveryStatus field for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const migrationResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [deliveryStatusField],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (migrationResult.status === 'fail') {
      throw new Error(
        `Failed to drop the message deliveryStatus field for workspace ${workspaceId}:\n${JSON.stringify(
          migrationResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Dropped the message deliveryStatus field for workspace ${workspaceId}`,
    );
  }
}
