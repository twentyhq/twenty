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
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CHAT_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.agentChatThreadRecordPage;

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER = CHAT_RECORD_PAGE.universalIdentifier;

const CHAT_TAB_UNIVERSAL_IDENTIFIER =
  CHAT_RECORD_PAGE.tabs.chat.universalIdentifier;

const CHAT_WIDGET_UNIVERSAL_IDENTIFIER =
  CHAT_RECORD_PAGE.tabs.chat.widgets.chat.universalIdentifier;

@RegisteredWorkspaceCommand('2.44.0', 1790756589463)
@Command({
  name: 'upgrade:2-44:add-chat-record-page',
  description:
    'Create the chat record page layout, whose single tab renders the conversation',
})
export class AddChatRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatObjectMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentChatThread object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // getStandardFlatEntitiesToCreateOrThrow treats a soft-deleted row as
    // present, so a deleted layout or tab would still get children created
    // under it
    const isParentSoftDeleted = [
      flatPageLayoutMaps.byUniversalIdentifier[PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
      flatPageLayoutTabMaps.byUniversalIdentifier[
        CHAT_TAB_UNIVERSAL_IDENTIFIER
      ],
    ].some((flatEntity) => isDefined(flatEntity?.deletedAt));

    if (isParentSoftDeleted) {
      this.logger.warn(
        `The chat record page was deleted in workspace ${workspaceId}, leaving it untouched`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // The chat widget type is only built on workspace creation, because older
    // upgrade steps run before its enum value exists. This 2.44 step runs after
    // the instance command that adds it.
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        isWorkspaceCreation: true,
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
        universalIdentifiers: [CHAT_TAB_UNIVERSAL_IDENTIFIER],
      });

    const pageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: [CHAT_WIDGET_UNIVERSAL_IDENTIFIER],
      });

    if (
      pageLayoutsToCreate.length +
        pageLayoutTabsToCreate.length +
        pageLayoutWidgetsToCreate.length ===
      0
    ) {
      this.logger.log(
        `chat record page already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    await this.runMigration({
      workspaceId,
      dryRun: options.dryRun ?? false,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
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
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Created the chat record page for workspace ${workspaceId}`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPageLayoutMaps, flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutMaps',
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    const pageLayoutsToDelete = [
      flatPageLayoutMaps.byUniversalIdentifier[PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
    ].filter(isDefined);
    const pageLayoutTabsToDelete = [
      flatPageLayoutTabMaps.byUniversalIdentifier[
        CHAT_TAB_UNIVERSAL_IDENTIFIER
      ],
    ].filter(isDefined);
    const pageLayoutWidgetsToDelete = [
      flatPageLayoutWidgetMaps.byUniversalIdentifier[
        CHAT_WIDGET_UNIVERSAL_IDENTIFIER
      ],
    ].filter(isDefined);

    if (
      pageLayoutsToDelete.length +
        pageLayoutTabsToDelete.length +
        pageLayoutWidgetsToDelete.length ===
      0
    ) {
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
          flatEntityToDelete: pageLayoutWidgetsToDelete,
          flatEntityToUpdate: [],
        },
        pageLayoutTab: {
          flatEntityToCreate: [],
          flatEntityToDelete: pageLayoutTabsToDelete,
          flatEntityToUpdate: [],
        },
        pageLayout: {
          flatEntityToCreate: [],
          flatEntityToDelete: pageLayoutsToDelete,
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
        `Failed to update the chat record page for workspace ${args.workspaceId}`,
      );
    }
  }
}
