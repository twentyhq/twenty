import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.universalIdentifier;
const HEADER_MESSAGE_ID_INDEX_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.indexes.headerMessageIdIndex.universalIdentifier;
const DELIVERY_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.fields.deliveryStatus.universalIdentifier;

@RegisteredWorkspaceCommand('2.33.0', 1787200120000)
@Command({
  name: 'upgrade:2-33:sync-message-delivery-metadata',
  description:
    'Index message.headerMessageId and add the outbound delivery outcomes to the message deliveryStatus select on existing workspaces',
})
export class SyncMessageDeliveryMetadataCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps, flatIndexMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatIndexMaps',
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          MESSAGE_OBJECT_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      this.logger.log(
        `message object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const isHeaderMessageIdIndexed = isDefined(
      flatIndexMaps.byUniversalIdentifier[
        HEADER_MESSAGE_ID_INDEX_UNIVERSAL_IDENTIFIER
      ],
    );

    const deliveryStatusField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: DELIVERY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      });

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

    const standardFlatIndex =
      findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        universalIdentifier: HEADER_MESSAGE_ID_INDEX_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(standardFlatIndex)) {
      throw new Error(
        'Standard application is missing the message headerMessageId index',
      );
    }

    const standardDeliveryStatusField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier: DELIVERY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (
      !isDefined(standardDeliveryStatusField) ||
      standardDeliveryStatusField.type !== FieldMetadataType.SELECT
    ) {
      throw new Error(
        'Standard application is missing the message deliveryStatus select',
      );
    }

    const flatIndexToCreate = isHeaderMessageIdIndexed ? [] : [standardFlatIndex];
    const flatFieldToUpdate: FlatFieldMetadata[] = [];

    if (
      isDefined(deliveryStatusField) &&
      deliveryStatusField.type === FieldMetadataType.SELECT
    ) {
      const workspaceOptionValues = new Set(
        (deliveryStatusField.options ?? []).map((option) => option.value),
      );
      const hasEveryOutcome = (
        standardDeliveryStatusField.options ?? []
      ).every((option) => workspaceOptionValues.has(option.value));

      if (!hasEveryOutcome) {
        flatFieldToUpdate.push({
          ...deliveryStatusField,
          options: standardDeliveryStatusField.options,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (flatIndexToCreate.length === 0 && flatFieldToUpdate.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would sync message delivery metadata for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: flatIndexToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatFieldToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to sync message delivery metadata for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }

    this.logger.log(
      `Synced message delivery metadata for workspace ${workspaceId}`,
    );
  }
}
