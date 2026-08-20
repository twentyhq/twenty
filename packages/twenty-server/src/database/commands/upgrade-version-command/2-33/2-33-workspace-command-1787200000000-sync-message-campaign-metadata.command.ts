import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE_CAMPAIGN = STANDARD_OBJECTS.messageCampaign;
const SKIPPED_COUNT_FIELD = MESSAGE_CAMPAIGN.fields.skippedCount;
const CAMPAIGN_STATUS_FIELD = MESSAGE_CAMPAIGN.fields.status;
const DELIVERY_STATUS_FIELD = STANDARD_OBJECTS.message.fields.deliveryStatus;

@RegisteredWorkspaceCommand('2.33.0', 1787200000000)
@Command({
  name: 'upgrade:2-33:sync-message-campaign-metadata',
  description:
    'Add the messageCampaign.skippedCount field, the CANCELED campaign status and the SENDING message delivery status on existing workspaces',
})
export class SyncMessageCampaignMetadataCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const messageCampaignObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: MESSAGE_CAMPAIGN.universalIdentifier,
      });

    if (!isDefined(messageCampaignObject)) {
      this.logger.log(
        `messageCampaign object does not exist for workspace ${workspaceId}, skipping`,
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
    const standardFieldMaps = standardAllFlatEntityMaps.flatFieldMetadataMaps;

    const flatEntityToCreate: FlatFieldMetadata[] = [];
    const flatEntityToUpdate: FlatFieldMetadata[] = [];
    const plannedChanges: string[] = [];

    const hasSkippedCountField = isDefined(
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: SKIPPED_COUNT_FIELD.universalIdentifier,
      }),
    );

    if (!hasSkippedCountField) {
      const standardSkippedCountField =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: standardFieldMaps,
          universalIdentifier: SKIPPED_COUNT_FIELD.universalIdentifier,
        });

      if (!isDefined(standardSkippedCountField)) {
        throw new Error(
          'Standard application is missing messageCampaign field skippedCount',
        );
      }

      flatEntityToCreate.push({
        ...standardSkippedCountField,
        viewFieldIds: [],
        viewFieldUniversalIdentifiers: [],
      });
      plannedChanges.push('messageCampaign.skippedCount field');
    }

    const selectOptionsToSync = [
      {
        label: 'CANCELED messageCampaign status',
        universalIdentifier: CAMPAIGN_STATUS_FIELD.universalIdentifier,
        expectedValue: MessageCampaignStatus.CANCELED,
      },
      {
        label: 'SENDING message deliveryStatus',
        universalIdentifier: DELIVERY_STATUS_FIELD.universalIdentifier,
        expectedValue: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING,
      },
    ];

    for (const selectOption of selectOptionsToSync) {
      const fieldToUpdate = this.buildSelectOptionsUpdate({
        workspaceId,
        workspaceFieldMaps: flatFieldMetadataMaps,
        standardFieldMaps,
        ...selectOption,
      });

      if (isDefined(fieldToUpdate)) {
        flatEntityToUpdate.push(fieldToUpdate);
        plannedChanges.push(selectOption.label);
      }
    }

    if (plannedChanges.length === 0) {
      return;
    }

    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add ${plannedChanges.join(', ')} for workspace ${workspaceId}`,
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
            fieldMetadata: {
              flatEntityToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to sync message campaign metadata:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to sync message campaign metadata for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added ${plannedChanges.join(', ')} for workspace ${workspaceId}`,
    );
  }

  private buildSelectOptionsUpdate({
    workspaceId,
    workspaceFieldMaps,
    standardFieldMaps,
    universalIdentifier,
    expectedValue,
    label,
  }: {
    workspaceId: string;
    workspaceFieldMaps: FlatEntityMaps<FlatFieldMetadata>;
    standardFieldMaps: FlatEntityMaps<FlatFieldMetadata>;
    universalIdentifier: string;
    expectedValue: string;
    label: string;
  }): FlatFieldMetadata | undefined {
    const workspaceField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>(
      { flatEntityMaps: workspaceFieldMaps, universalIdentifier },
    );

    if (!isDefined(workspaceField)) {
      this.logger.log(
        `${label} select does not exist for workspace ${workspaceId}, skipping that option`,
      );

      return undefined;
    }

    if (workspaceField.type !== FieldMetadataType.SELECT) {
      throw new Error(
        `${label} is not a SELECT field for workspace ${workspaceId}`,
      );
    }

    const hasOption = (workspaceField.options ?? []).some(
      (option) => option.value === expectedValue,
    );

    if (hasOption) {
      return undefined;
    }

    const standardField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>(
      { flatEntityMaps: standardFieldMaps, universalIdentifier },
    );

    if (
      !isDefined(standardField) ||
      standardField.type !== FieldMetadataType.SELECT
    ) {
      throw new Error(`Standard application is missing the ${label} select`);
    }

    return {
      ...workspaceField,
      options: standardField.options,
      updatedAt: new Date().toISOString(),
    };
  }
}
