import { Command } from 'nest-commander';


import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { FieldMetadataType, MessageCampaignStatus } from 'twenty-shared/types';
import { MESSAGE_CAMPAIGN_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-35/constants/message-campaign-standard-object-universal-identifiers.constant';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { buildNavigationCommandMenuItemOperationsOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/build-navigation-command-menu-item-operations-or-throw.util';
import { collectMessageCampaignStandardUniversalIdentifiers } from 'src/database/commands/upgrade-version-command/2-35/utils/collect-message-campaign-standard-universal-identifiers.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getExistingOrStandardFlatEntityOrThrow, getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { isDefined } from 'twenty-shared/utils';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';

const MESSAGE_CAMPAIGN = STANDARD_OBJECTS.messageCampaign;
const SKIPPED_COUNT_FIELD = MESSAGE_CAMPAIGN.fields.skippedCount;
const CAMPAIGN_STATUS_FIELD = MESSAGE_CAMPAIGN.fields.status;
const DELIVERY_STATUS_FIELD = STANDARD_OBJECTS.message.fields.deliveryStatus;
const MESSAGE_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.universalIdentifier;
const HEADER_MESSAGE_ID_INDEX_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.indexes.headerMessageIdIndex.universalIdentifier;
const DELIVERY_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.fields.deliveryStatus.universalIdentifier;

@RegisteredWorkspaceCommand('2.35.0', 1787578823597)
@Command({
  name: 'upgrade:2-35:sync-message-campaign-schema',
  description:
    'Bring existing workspaces to the MessageCampaign schema: standard objects, search, campaign metadata and message delivery metadata',
})
export class SyncMessageCampaignSchemaCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncStandardObjects(args);
    await this.makeCampaignSearchable(args);
    await this.syncCampaignMetadata(args);
    await this.syncDeliveryMetadata(args);
  }

  private async syncStandardObjects({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatSearchFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatSearchFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatCommandMenuItemMaps',
    ]);

    const personObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.person.universalIdentifier
      ];

    if (!isDefined(personObjectMetadata)) {
      this.logger.warn(
        `person object not found for workspace ${workspaceId}, skipping MessageCampaign standard metadata sync`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now,
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const universalIdentifiers =
      collectMessageCampaignStandardUniversalIdentifiers({
        standardAllFlatEntityMaps,
      });

    const objectMetadatasForNavigation =
      MESSAGE_CAMPAIGN_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          getExistingOrStandardFlatEntityOrThrow<FlatObjectMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatObjectMetadataMaps,
            existingFlatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier,
          }),
      );

    const navigationCommandMenuItemOperations =
      buildNavigationCommandMenuItemOperationsOrThrow({
        existingFlatCommandMenuItemMaps: flatCommandMenuItemMaps,
        objectMetadatasForNavigation,
        applicationId: twentyStandardFlatApplication.id,
        workspaceId,
        now,
        renamedCollisionObjectMetadatas: [],
      });

    const allFlatEntityOperationByMetadataName = {
      objectMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatObjectMetadataMaps,
            existingFlatEntityMaps: flatObjectMetadataMaps,
            universalIdentifiers: universalIdentifiers.objectMetadata,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      fieldMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers: universalIdentifiers.fieldMetadata,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers: universalIdentifiers.index,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      searchFieldMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatSearchFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatSearchFieldMetadataMaps,
            existingFlatEntityMaps: flatSearchFieldMetadataMaps,
            universalIdentifiers: universalIdentifiers.searchFieldMetadata,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      view: {
        flatEntityToCreate: getStandardFlatEntitiesToCreateOrThrow<FlatView>({
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
          existingFlatEntityMaps: flatViewMaps,
          universalIdentifiers: universalIdentifiers.view,
        }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      viewFieldGroup: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatViewFieldGroup>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatViewFieldGroupMaps,
            existingFlatEntityMaps: flatViewFieldGroupMaps,
            universalIdentifiers: universalIdentifiers.viewFieldGroup,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      viewField: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
            existingFlatEntityMaps: flatViewFieldMaps,
            universalIdentifiers: universalIdentifiers.viewField,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      pageLayout: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatPageLayout>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatPageLayoutMaps,
            existingFlatEntityMaps: flatPageLayoutMaps,
            universalIdentifiers: universalIdentifiers.pageLayout,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      pageLayoutTab: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatPageLayoutTabMaps,
            existingFlatEntityMaps: flatPageLayoutTabMaps,
            universalIdentifiers: universalIdentifiers.pageLayoutTab,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      pageLayoutWidget: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
            existingFlatEntityMaps: flatPageLayoutWidgetMaps,
            universalIdentifiers: universalIdentifiers.pageLayoutWidget,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      commandMenuItem: {
        flatEntityToCreate: [
          ...getStandardFlatEntitiesToCreateOrThrow<FlatCommandMenuItem>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatCommandMenuItemMaps,
            existingFlatEntityMaps: flatCommandMenuItemMaps,
            universalIdentifiers: universalIdentifiers.commandMenuItem,
          }),
          ...navigationCommandMenuItemOperations.flatEntityToCreate,
        ],
        flatEntityToDelete: [],
        flatEntityToUpdate:
          navigationCommandMenuItemOperations.flatEntityToUpdate,
      },
    };

    const totalOperationCount = Object.values(
      allFlatEntityOperationByMetadataName,
    ).reduce(
      (total, operations) =>
        total +
        operations.flatEntityToCreate.length +
        operations.flatEntityToUpdate.length,
      0,
    );

    if (totalOperationCount === 0) {
      this.logger.log(
        `MessageCampaign standard metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Applying ${totalOperationCount} MessageCampaign standard metadata operation(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to create the MessageCampaign standard objects for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Applied ${totalOperationCount} MessageCampaign standard metadata operation(s) for workspace ${workspaceId}`,
    );
  }

  private async makeCampaignSearchable({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const messageCampaignObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.messageCampaign.universalIdentifier
      ];

    if (!isDefined(messageCampaignObjectMetadata)) {
      this.logger.log(
        `messageCampaign object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (messageCampaignObjectMetadata.isSearchable) {
      this.logger.log(
        `messageCampaign is already searchable for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Making messageCampaign searchable for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...messageCampaignObjectMetadata,
                  isSearchable: true,
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to make messageCampaign searchable for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Made messageCampaign searchable for workspace ${workspaceId}`,
    );
  }

  private async syncCampaignMetadata({
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

  private async syncDeliveryMetadata({
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
