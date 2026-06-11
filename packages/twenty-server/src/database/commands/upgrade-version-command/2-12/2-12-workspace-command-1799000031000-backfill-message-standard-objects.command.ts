import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildNavigationCommandMenuItemOperationsOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/build-navigation-command-menu-item-operations-or-throw.util';
import {
  getExistingOrStandardFlatEntityOrThrow,
  getStandardFlatEntitiesToCreateOrThrow,
} from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const getUniversalIdentifiers = (
  entitiesByName: Record<string, { universalIdentifier: string }>,
): string[] =>
  Object.values(entitiesByName).map((entity) => entity.universalIdentifier);

const MESSAGE_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.messageCampaign.universalIdentifier,
  STANDARD_OBJECTS.messageList.universalIdentifier,
  STANDARD_OBJECTS.messageListMember.universalIdentifier,
  STANDARD_OBJECTS.messageTopic.universalIdentifier,
  STANDARD_OBJECTS.messageTopicSubscription.universalIdentifier,
  STANDARD_OBJECTS.messageSuppression.universalIdentifier,
];

// Fields the feature adds to PRE-EXISTING objects (person/timelineActivity/
// message). These can collide with a custom field of the same name on the same
// object, so the existing one is renamed before the standard field is created.
const NEW_FIELDS_ON_EXISTING_OBJECTS_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.person.fields.messageTopicSubscriptions.universalIdentifier,
  STANDARD_OBJECTS.person.fields.listMemberships.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetMessageList
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetMessageTopic
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetMessageCampaign
    .universalIdentifier,
  STANDARD_OBJECTS.message.fields.messageCampaign.universalIdentifier,
  STANDARD_OBJECTS.message.fields.deliveryStatus.universalIdentifier,
  STANDARD_OBJECTS.messageParticipant.fields.messageCampaign.universalIdentifier,
];

const MESSAGE_FIELD_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageCampaign.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageList.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageListMember.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageTopic.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageTopicSubscription.fields),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageSuppression.fields),
  ...NEW_FIELDS_ON_EXISTING_OBJECTS_UNIVERSAL_IDENTIFIERS,
];

const MESSAGE_INDEX_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageCampaign.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageList.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageListMember.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageTopic.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageTopicSubscription.indexes),
  ...getUniversalIdentifiers(STANDARD_OBJECTS.messageSuppression.indexes),
  STANDARD_OBJECTS.message.indexes.messageCampaignIdIndex.universalIdentifier,
  STANDARD_OBJECTS.messageParticipant.indexes.messageCampaignIdIndex
    .universalIdentifier,
];

const MESSAGE_NAVIGABLE_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.messageCampaign.universalIdentifier,
  STANDARD_OBJECTS.messageList.universalIdentifier,
  STANDARD_OBJECTS.messageTopic.universalIdentifier,
];

const MESSAGE_RECORD_PAGE_KEYS = [
  'messageCampaignRecordPage',
  'messageListRecordPage',
  'messageTopicRecordPage',
] as const;

const MESSAGE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS = MESSAGE_RECORD_PAGE_KEYS.map(
  (key) => STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS[key].universalIdentifier,
);

const MESSAGE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS =
  MESSAGE_RECORD_PAGE_KEYS.flatMap((key) =>
    getUniversalIdentifiers(
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS[key].tabs,
    ),
  );

const MESSAGE_RECORD_PAGE_WIDGET_UNIVERSAL_IDENTIFIERS =
  MESSAGE_RECORD_PAGE_KEYS.flatMap((key) =>
    Object.values(STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS[key].tabs).flatMap(
      (tab) => getUniversalIdentifiers(tab.widgets),
    ),
  );

// Widgets the feature adds to the pre-existing person record page (the
// Topics/Lists junction pickers shown on the person detail page).
const PERSON_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home.widgets
    .messageTopicSubscriptions.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home.widgets
    .listMemberships.universalIdentifier,
];

const MESSAGE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  ...MESSAGE_RECORD_PAGE_WIDGET_UNIVERSAL_IDENTIFIERS,
  ...PERSON_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
];

// Deliberately NOT registered in the upgrade sequence (no @RegisteredWorkspaceCommand):
// the marketing-emails feature ships dark behind IS_EMAIL_GROUP_ENABLED, and this
// command is heavy on large instances. It is run manually per workspace (-w) during
// the progressive rollout. Re-register it under the then-current version once the
// fleet has been migrated, so the standard upgrade path covers stragglers and
// self-hosted instances. New workspaces get these entities from the standard
// application at provisioning and do not need this command.
@Command({
  name: 'upgrade:2-12:backfill-message-standard-objects',
  description:
    'Create the message marketing standard objects (messageCampaign, messageList, messageListMember, messageTopic, messageTopicSubscription, messageSuppression) in existing workspaces',
})
export class BackfillMessageStandardObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatCommandMenuItemMaps',
    ]);

    // The message objects' relations target person, message and timelineActivity.
    // Unprovisioned workspaces (no standard objects yet) have none of them, so
    // there is nothing to relate to — skip them.
    const hasPrerequisiteObjects = [
      STANDARD_OBJECTS.person.universalIdentifier,
      STANDARD_OBJECTS.message.universalIdentifier,
      STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier],
      ),
    );

    if (!hasPrerequisiteObjects) {
      this.logger.warn(
        `Workspace ${workspaceId} is missing prerequisite standard objects (person/message/timelineActivity), skipping message standard objects backfill`,
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

    // A custom field sharing a name with a standard field we are about to add
    // to an existing object trips the per-object unique field name. Rename the
    // existing one to "<name>Old" first so the standard field can be created.
    const fieldMetadataRenameUpdates =
      NEW_FIELDS_ON_EXISTING_OBJECTS_UNIVERSAL_IDENTIFIERS.flatMap(
        (universalIdentifier) => {
          const standardField =
            standardAllFlatEntityMaps.flatFieldMetadataMaps
              .byUniversalIdentifier[universalIdentifier];

          if (!isDefined(standardField)) {
            return [];
          }

          const collidingField = Object.values(
            flatFieldMetadataMaps.byUniversalIdentifier,
          ).find(
            (field) =>
              isDefined(field) &&
              field.universalIdentifier !== universalIdentifier &&
              field.objectMetadataUniversalIdentifier ===
                standardField.objectMetadataUniversalIdentifier &&
              field.name === standardField.name,
          );

          if (!isDefined(collidingField)) {
            return [];
          }

          return [
            {
              ...collidingField,
              name: `${collidingField.name}Old`,
              label: `${collidingField.label} (Old)`,
              isLabelSyncedWithName: false,
              updatedAt: now,
            },
          ];
        },
      );

    const navigationCommandMenuItemOperations =
      buildNavigationCommandMenuItemOperationsOrThrow({
        existingFlatCommandMenuItemMaps: flatCommandMenuItemMaps,
        objectMetadatasForNavigation:
          MESSAGE_NAVIGABLE_OBJECT_UNIVERSAL_IDENTIFIERS.map(
            (universalIdentifier) =>
              getExistingOrStandardFlatEntityOrThrow<FlatObjectMetadata>({
                standardFlatEntityMaps:
                  standardAllFlatEntityMaps.flatObjectMetadataMaps,
                existingFlatEntityMaps: flatObjectMetadataMaps,
                universalIdentifier,
              }),
          ),
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
            universalIdentifiers: MESSAGE_OBJECT_UNIVERSAL_IDENTIFIERS,
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
            universalIdentifiers: MESSAGE_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers: MESSAGE_INDEX_UNIVERSAL_IDENTIFIERS,
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
            universalIdentifiers: MESSAGE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
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
            universalIdentifiers: MESSAGE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS,
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
            universalIdentifiers:
              MESSAGE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      commandMenuItem: navigationCommandMenuItemOperations,
    };

    const totalOperationCount =
      fieldMetadataRenameUpdates.length +
      Object.values(allFlatEntityOperationByMetadataName).reduce(
        (total, operations) => total + operations.flatEntityToCreate.length,
        0,
      );

    if (totalOperationCount === 0) {
      this.logger.log(
        `Message standard objects already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      if (fieldMetadataRenameUpdates.length > 0) {
        this.logger.log(
          `[DRY RUN] Would rename ${fieldMetadataRenameUpdates.length} colliding custom field(s) for workspace ${workspaceId}`,
        );
      }

      this.logger.log(
        `[DRY RUN] Would apply ${totalOperationCount} message standard metadata operations for workspace ${workspaceId}`,
      );

      return;
    }

    // Renames must commit before the create: a custom field sharing a name with
    // a standard field about to be created trips the per-object unique name.
    const collisionRenameMigrations = fieldMetadataRenameUpdates.map(
      (flatFieldMetadata) => ({
        applicationUniversalIdentifier:
          flatFieldMetadata.applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [flatFieldMetadata],
          },
        },
      }),
    );

    // Collisions can belong to different applications, so each rename runs as
    // its own migration scoped to the colliding entity's application.
    for (const {
      applicationUniversalIdentifier,
      allFlatEntityOperationByMetadataName: renameOperations,
    } of collisionRenameMigrations) {
      const renameResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            applicationUniversalIdentifier,
            workspaceId,
            allFlatEntityOperationByMetadataName: renameOperations,
          },
        );

      if (renameResult.status === 'fail') {
        throw new Error(
          `Failed to rename colliding entity for workspace ${workspaceId}: ${JSON.stringify(
            renameResult,
            null,
            2,
          )}`,
        );
      }
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
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
        `Failed to create message standard objects for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Applied ${totalOperationCount} message standard metadata operations for workspace ${workspaceId}`,
    );

    if (!isDefined(dataSource)) {
      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const recipientBackfillResult = await dataSource.query(
      `UPDATE "${schemaName}"."messageParticipant" mp
       SET "messageCampaignId" = m."messageCampaignId"
       FROM "${schemaName}"."message" m
       WHERE mp."messageId" = m.id
         AND m."messageCampaignId" IS NOT NULL
         AND mp."role" = 'TO'
         AND mp."messageCampaignId" IS NULL`,
      undefined,
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    this.logger.log(
      `Backfilled messageCampaignId for ${recipientBackfillResult?.[1] ?? 0} recipient participants in workspace ${workspaceId}`,
    );
  }
}
