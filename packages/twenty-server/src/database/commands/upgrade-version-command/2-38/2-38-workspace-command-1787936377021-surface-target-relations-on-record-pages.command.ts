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
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE_THREAD_RECORD_PAGE_FIELDS_VIEW =
  STANDARD_OBJECTS.messageThread.views.messageThreadRecordPageFields;

const CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW =
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields;

const MESSAGE_THREAD_HOME_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageThreadRecordPage.tabs.home
    .universalIdentifier;

const MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageThreadRecordPage.tabs.home
    .widgets.fields.universalIdentifier;

@RegisteredWorkspaceCommand('2.38.0', 1787936377021)
@Command({
  name: 'upgrade:2-38:surface-target-relations-on-record-pages',
  description:
    'Show the Relations target junctions on record pages: a fields widget on the message thread record page and a Relations field on the calendar event record page',
})
export class SurfaceTargetRelationsOnRecordPagesCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    // The target relation fields come from the 2.37 sync command; a workspace
    // it skipped has nothing to surface.
    const hasMessageThreadTargetsField = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.messageThread.fields.messageThreadTargets
          .universalIdentifier
      ],
    );
    const hasCalendarEventTargetsField = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.calendarEvent.fields.calendarEventTargets
          .universalIdentifier
      ],
    );

    if (!hasMessageThreadTargetsField && !hasCalendarEventTargetsField) {
      this.logger.warn(
        `Skipping target relation surfaces for workspace ${workspaceId}: target relation fields are missing`,
      );

      return;
    }

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const viewsToCreate = hasMessageThreadTargetsField
      ? getStandardFlatEntitiesToCreateOrThrow<FlatView>({
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
          existingFlatEntityMaps: flatViewMaps,
          universalIdentifiers: [
            MESSAGE_THREAD_RECORD_PAGE_FIELDS_VIEW.universalIdentifier,
          ],
        })
      : [];

    const viewFieldGroupsToCreate = hasMessageThreadTargetsField
      ? getStandardFlatEntitiesToCreateOrThrow<FlatViewFieldGroup>({
          standardFlatEntityMaps:
            standardAllFlatEntityMaps.flatViewFieldGroupMaps,
          existingFlatEntityMaps: flatViewFieldGroupMaps,
          universalIdentifiers: [
            MESSAGE_THREAD_RECORD_PAGE_FIELDS_VIEW.viewFieldGroups.general
              .universalIdentifier,
          ],
        })
      : [];

    const viewFieldUniversalIdentifiers = [
      ...(hasMessageThreadTargetsField
        ? [
            MESSAGE_THREAD_RECORD_PAGE_FIELDS_VIEW.viewFields
              .messageThreadTargets.universalIdentifier,
          ]
        : []),
      ...(hasCalendarEventTargetsField &&
      isDefined(
        flatViewMaps.byUniversalIdentifier[
          CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW.universalIdentifier
        ],
      )
        ? [
            CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW.viewFields
              .calendarEventTargets.universalIdentifier,
          ]
        : []),
    ];

    const viewFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers: viewFieldUniversalIdentifiers,
      });

    const hasMessageThreadHomeTab = isDefined(
      flatPageLayoutTabMaps.byUniversalIdentifier[
        MESSAGE_THREAD_HOME_TAB_UNIVERSAL_IDENTIFIER
      ],
    );

    const pageLayoutWidgetsToCreate =
      hasMessageThreadTargetsField && hasMessageThreadHomeTab
        ? getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
            existingFlatEntityMaps: flatPageLayoutWidgetMaps,
            universalIdentifiers: [
              MESSAGE_THREAD_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
            ],
          })
        : [];

    const totalOperationCount =
      viewsToCreate.length +
      viewFieldGroupsToCreate.length +
      viewFieldsToCreate.length +
      pageLayoutWidgetsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Target relation surfaces already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Applying ${totalOperationCount} target relation surface operation(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
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
            pageLayoutWidget: {
              flatEntityToCreate: pageLayoutWidgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to surface target relations on record pages for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Surfaced target relations on record pages for workspace ${workspaceId}`,
    );
  }
}
