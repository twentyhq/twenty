import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CONVERSATIONS_WIDGET_EXPRESSION =
  'featureFlags.IS_CONVERSATIONS_TAB_ENABLED';

const CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.conversations
    .widgets.conversations.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier,
];

// Workspaces created before the Conversations widget carried its flag as an
// expression hold it ungated
@RegisteredWorkspaceCommand('2.44.0', 1790700866168)
@Command({
  name: 'upgrade:2-44:gate-conversations-widget-on-feature-flag',
  description:
    'Hide the standard Conversations widget unless IS_CONVERSATIONS_TAB_ENABLED is on',
})
export class GateConversationsWidgetOnFeatureFlagCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setExpression(args, CONVERSATIONS_WIDGET_EXPRESSION);
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setExpression(args, null);
  }

  private async setExpression(
    { workspaceId, options }: RunOnWorkspaceArgs,
    conditionalAvailabilityExpression: string | null,
  ): Promise<void> {
    const { flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);
    const now = new Date().toISOString();
    const widgetsToUpdate = CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        flatPageLayoutWidgetMaps.byUniversalIdentifier[universalIdentifier],
    )
      .filter(isDefined)
      .filter(
        (widget) =>
          widget.conditionalAvailabilityExpression !==
          conditionalAvailabilityExpression,
      )
      .map((widget) => ({
        ...widget,
        conditionalAvailabilityExpression,
        updatedAt: now,
      }));

    if (!isNonEmptyArray(widgetsToUpdate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating ${widgetsToUpdate.length} Conversations widget(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: widgetsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
