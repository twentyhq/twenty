import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE_ATTACHMENT_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.attachment.fields.targetMessage.universalIdentifier,
  STANDARD_OBJECTS.message.fields.attachments.universalIdentifier,
];

const MESSAGE_ATTACHMENT_INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.attachment.indexes.messageIdIndex.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.57.0', 1793876432369)
@Command({
  name: 'upgrade:2-57:add-message-attachment-target',
  description:
    'Add the message attachment target relation in existing workspaces and enable message attachments',
})
export class AddMessageAttachmentTargetCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly featureFlagService: FeatureFlagService,
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.message.universalIdentifier
        ],
      )
    ) {
      this.logger.warn(
        `message object not found for workspace ${workspaceId}, skipping attachment target creation`,
      );

      return;
    }

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.attachment.universalIdentifier
        ],
      )
    ) {
      this.logger.warn(
        `attachment object not found for workspace ${workspaceId}, skipping attachment target creation`,
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
    const allFlatEntityOperationByMetadataName = {
      fieldMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers:
              MESSAGE_ATTACHMENT_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers:
              MESSAGE_ATTACHMENT_INDEX_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
    };
    const fieldCount =
      allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate
        .length;
    const indexCount =
      allFlatEntityOperationByMetadataName.index.flatEntityToCreate.length;
    const creationSummary = `${fieldCount} field(s) and ${indexCount} index(es)`;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${creationSummary} and enable message attachments for workspace ${workspaceId}`,
      );

      return;
    }

    if (fieldCount + indexCount > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            shouldDeferActions: false,
            allFlatEntityOperationByMetadataName,
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to create the message attachment target for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
        );
      }

      this.logger.log(
        `Created ${creationSummary} for workspace ${workspaceId}`,
      );
    }

    await this.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId,
      featureFlag: FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
      value: true,
    });
  }
}
