import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { bindFieldsWidgetToExistingView } from 'src/database/commands/upgrade-version-command/2-42/utils/bind-fields-widget-to-existing-view.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE = STANDARD_OBJECTS.message;
const MESSAGE_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageRecordPage;

const FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  MESSAGE.views.messageRecordPageFields.universalIdentifier;

const FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS = Object.values(
  MESSAGE.views.messageRecordPageFields.viewFieldGroups,
).map((viewFieldGroup) => viewFieldGroup.universalIdentifier);

const FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  MESSAGE.views.messageRecordPageFields.viewFields,
).map((viewField) => viewField.universalIdentifier);

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  MESSAGE_RECORD_PAGE.universalIdentifier;

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  MESSAGE_RECORD_PAGE.tabs.home.universalIdentifier;

const PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS = [HOME_TAB_UNIVERSAL_IDENTIFIER];

const FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  MESSAGE_RECORD_PAGE.tabs.home.widgets.fields.universalIdentifier;

const PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
];

@RegisteredWorkspaceCommand('2.42.0', 1789663454001)
@Command({
  name: 'upgrade:2-42:sync-message-record-page',
  description:
    'Create the Message record page layout and its fields view in existing workspaces, so opening a message record shows its fields instead of an empty page.',
})
export class SyncMessageRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
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
      flatObjectMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          MESSAGE.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `message object metadata does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingFieldsView =
      flatViewMaps.byUniversalIdentifier[FIELDS_VIEW_UNIVERSAL_IDENTIFIER];

    // A soft-deleted fields view cannot be recreated under its identifier, and
    // a widget pointing at it would render nothing, so the workspace keeps the
    // record page it has.
    if (isDefined(existingFieldsView?.deletedAt)) {
      this.logger.warn(
        `The message fields view was deleted in workspace ${workspaceId}, leaving the record page untouched`,
      );

      return;
    }

    // getStandardFlatEntitiesToCreateOrThrow treats a soft-deleted row as
    // present, so it would leave a deleted parent in place and still create the
    // children under it. The workspace cache loads with withDeleted, so the
    // check has to be explicit.
    const softDeletedParent = [
      {
        label: 'record page layout',
        flatEntity:
          flatPageLayoutMaps.byUniversalIdentifier[
            PAGE_LAYOUT_UNIVERSAL_IDENTIFIER
          ],
      },
      {
        label: 'home tab',
        flatEntity:
          flatPageLayoutTabMaps.byUniversalIdentifier[
            HOME_TAB_UNIVERSAL_IDENTIFIER
          ],
      },
    ].find(({ flatEntity }) => isDefined(flatEntity?.deletedAt));

    if (isDefined(softDeletedParent)) {
      this.logger.warn(
        `The message ${softDeletedParent.label} was deleted in workspace ${workspaceId}, leaving the record page untouched`,
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

    const viewsToCreate = getStandardFlatEntitiesToCreateOrThrow<FlatView>({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
      existingFlatEntityMaps: flatViewMaps,
      universalIdentifiers: [FIELDS_VIEW_UNIVERSAL_IDENTIFIER],
    });

    const viewFieldGroupsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewFieldGroup>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatViewFieldGroupMaps,
        existingFlatEntityMaps: flatViewFieldGroupMaps,
        universalIdentifiers: FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
      });

    const viewFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      });

    const pageLayoutsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayout>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutMaps,
        existingFlatEntityMaps: flatPageLayoutMaps,
        universalIdentifiers: [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
      });

    const pageLayoutTabsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        existingFlatEntityMaps: flatPageLayoutTabMaps,
        universalIdentifiers: PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS,
      });

    const pageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
      }).map((flatPageLayoutWidget) =>
        bindFieldsWidgetToExistingView({
          flatPageLayoutWidget,
          fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
          existingFieldsView,
        }),
      );

    const totalOperationCount =
      viewsToCreate.length +
      viewFieldGroupsToCreate.length +
      viewFieldsToCreate.length +
      pageLayoutsToCreate.length +
      pageLayoutTabsToCreate.length +
      pageLayoutWidgetsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `message record page already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${viewsToCreate.length} view(s), ${viewFieldGroupsToCreate.length} field group(s), ${viewFieldsToCreate.length} view field(s), ${pageLayoutsToCreate.length} layout(s), ${pageLayoutTabsToCreate.length} tab(s), ${pageLayoutWidgetsToCreate.length} widget(s)`,
    );

    if (isDryRun) {
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
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: viewFieldGroupsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayout: {
              flatEntityToCreate: pageLayoutsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: pageLayoutTabsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: pageLayoutWidgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to sync the message record page for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Synced the message record page for workspace ${workspaceId}`,
    );
  }
}
