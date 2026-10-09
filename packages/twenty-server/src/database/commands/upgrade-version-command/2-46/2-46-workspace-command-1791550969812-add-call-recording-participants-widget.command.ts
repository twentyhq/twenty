import { Command } from 'nest-commander';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALL_RECORDING_HOME_TAB =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs.home;

const PARTICIPANTS_WIDGET_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING_HOME_TAB.widgets.participants.universalIdentifier;

@RegisteredWorkspaceCommand('2.46.0', 1791550969812)
@Command({
  name: 'upgrade:2-46:add-call-recording-participants-widget',
  description:
    'Add the Participants widget to the home tab of the CallRecording record page in existing workspaces',
})
export class AddCallRecordingParticipantsWidgetCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    const homeTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[
        CALL_RECORDING_HOME_TAB.universalIdentifier
      ];

    if (!isDefined(homeTab) || isDefined(homeTab.deletedAt)) {
      this.logger.log(
        `CallRecording home tab does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // The widget type is only built on workspace creation, because older
    // upgrade steps run before its enum value exists. This 2.46 step runs after
    // the instance command that adds it.
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        isWorkspaceCreation: true,
      });

    const standardPageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: [PARTICIPANTS_WIDGET_UNIVERSAL_IDENTIFIER],
      });

    if (standardPageLayoutWidgetsToCreate.length === 0) {
      this.logger.log(
        `CallRecording record page already has the Participants widget for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // Workspaces may have added widgets to the home tab, so the standard
    // index could land in the middle of them
    const lastWidgetIndex = Math.max(
      -1,
      ...Object.values(flatPageLayoutWidgetMaps.byUniversalIdentifier)
        .filter(isDefined)
        .flatMap((widget) =>
          widget.pageLayoutTabId === homeTab.id &&
          !isDefined(widget.deletedAt) &&
          widget.position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
            ? [widget.position.index]
            : [],
        ),
    );

    const pageLayoutWidgetsToCreate = standardPageLayoutWidgetsToCreate.map(
      (pageLayoutWidget) => ({
        ...pageLayoutWidget,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: lastWidgetIndex + 1,
        },
      }),
    );

    await this.runMigration({
      workspaceId,
      dryRun: options.dryRun ?? false,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        pageLayoutWidget: {
          flatEntityToCreate: pageLayoutWidgetsToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Added the CallRecording Participants widget for workspace ${workspaceId}`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);

    const participantsWidget =
      flatPageLayoutWidgetMaps.byUniversalIdentifier[
        PARTICIPANTS_WIDGET_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(participantsWidget)) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.runMigration({
      workspaceId,
      dryRun: options.dryRun ?? false,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        pageLayoutWidget: {
          flatEntityToCreate: [],
          flatEntityToDelete: [participantsWidget],
          flatEntityToUpdate: [],
        },
      },
    });
  }

  private async runMigration(
    args: Omit<
      Parameters<
        WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
      >[0],
      'isSystemBuild'
    >,
  ): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        { ...args, isSystemBuild: true },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to update the CallRecording Participants widget for workspace ${args.workspaceId}`,
      );
    }
  }
}
