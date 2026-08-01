import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const getUniversalIdentifiers = (
  entitiesByName: Record<string, { universalIdentifier: string }>,
): string[] =>
  Object.values(entitiesByName).map((entity) => entity.universalIdentifier);

const OBJECT_METADATA_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.messageCampaign.universalIdentifier,
  STANDARD_OBJECTS.messageList.universalIdentifier,
  STANDARD_OBJECTS.messageListMember.universalIdentifier,
];

const FIELD_METADATA_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageCampaign.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageList.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageListMember.fields),
  STANDARD_OBJECTS.person.fields.listMemberships.universalIdentifier,
  STANDARD_OBJECTS.message.fields.messageCampaign.universalIdentifier,
  STANDARD_OBJECTS.messageParticipant.fields.messageCampaign
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetMessageList
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetMessageCampaign
    .universalIdentifier,
];

const INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.messageCampaign.indexes.unsubscribeTopicIdIndex
    .universalIdentifier,
  STANDARD_OBJECTS.messageCampaign.indexes.listIdIndex.universalIdentifier,
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageListMember.indexes),
  STANDARD_OBJECTS.message.indexes.messageCampaignIdIndex.universalIdentifier,
  STANDARD_OBJECTS.messageParticipant.indexes.messageCampaignIdIndex
    .universalIdentifier,
];

const VIEW_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns
    .universalIdentifier,
  STANDARD_OBJECTS.messageList.views.allMessageLists.universalIdentifier,
];

const VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns.viewFields,
  ),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.messageList.views.allMessageLists.viewFields,
  ),
];

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage
    .universalIdentifier,
];

const PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs.home
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs.home
    .universalIdentifier,
];

const PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs
      .home.widgets,
  ),
  ...getUniversalIdentifiers(
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage.tabs.home
      .widgets,
  ),
];

type MetadataOperations<T extends SyncableFlatEntity> = {
  flatEntityToCreate: T[];
  flatEntityToDelete: T[];
  flatEntityToUpdate: T[];
};

const buildCreateOperations = <T extends SyncableFlatEntity>({
  existingFlatEntityMaps,
  standardFlatEntityMaps,
  universalIdentifiers,
}: {
  existingFlatEntityMaps: FlatEntityMaps<T>;
  standardFlatEntityMaps: FlatEntityMaps<T>;
  universalIdentifiers: string[];
}): MetadataOperations<T> => ({
  flatEntityToCreate: getStandardFlatEntitiesToCreateOrThrow({
    existingFlatEntityMaps,
    standardFlatEntityMaps,
    universalIdentifiers,
  }),
  flatEntityToDelete: [],
  flatEntityToUpdate: [],
});

@RegisteredWorkspaceCommand('2.25.0', 1785600000000)
@Command({
  name: 'upgrade:2-25:provision-message-campaign-standard-metadata',
  description:
    'Provision MessageCampaign, MessageList, and MessageListMember standard metadata on existing workspaces',
})
export class ProvisionMessageCampaignStandardMetadataCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatObjectMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatViewFieldMaps,
      flatViewMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatObjectMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewFieldMaps',
      'flatViewMaps',
    ]);

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
      objectMetadata: buildCreateOperations<FlatObjectMetadata>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatObjectMetadataMaps,
        existingFlatEntityMaps: flatObjectMetadataMaps,
        universalIdentifiers: OBJECT_METADATA_UNIVERSAL_IDENTIFIERS,
      }),
      fieldMetadata: buildCreateOperations<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: FIELD_METADATA_UNIVERSAL_IDENTIFIERS,
      }),
      index: buildCreateOperations<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: INDEX_UNIVERSAL_IDENTIFIERS,
      }),
      view: buildCreateOperations<FlatView>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
        existingFlatEntityMaps: flatViewMaps,
        universalIdentifiers: VIEW_UNIVERSAL_IDENTIFIERS,
      }),
      viewField: buildCreateOperations<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers: VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      }),
      pageLayout: buildCreateOperations<FlatPageLayout>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutMaps,
        existingFlatEntityMaps: flatPageLayoutMaps,
        universalIdentifiers: PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
      }),
      pageLayoutTab: buildCreateOperations<FlatPageLayoutTab>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        existingFlatEntityMaps: flatPageLayoutTabMaps,
        universalIdentifiers: PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS,
      }),
      pageLayoutWidget: buildCreateOperations<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
      }),
    };

    const operationCount = Object.values(
      allFlatEntityOperationByMetadataName,
    ).reduce(
      (count, operations) => count + operations.flatEntityToCreate.length,
      0,
    );

    if (operationCount === 0) {
      this.logger.log(
        `Message campaign standard metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would apply ${operationCount} message campaign standard metadata operations for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to provision message campaign standard metadata for workspace ${workspaceId}: ${JSON.stringify(
          result,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Provisioned message campaign standard metadata for workspace ${workspaceId}`,
    );
  }
}
