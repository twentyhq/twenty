import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const AI_CHAT_INBOX_FLAG = 'IS_AI_CHAT_INBOX_ENABLED';

const MERGED_FLAGS = [
  'IS_CONVERSATIONS_TAB_ENABLED',
  'IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED',
];

const CONVERSATIONS_TAB_WIDGET_EXPRESSION =
  'featureFlags.IS_CONVERSATIONS_TAB_ENABLED';

const AI_CHAT_INBOX_WIDGET_EXPRESSION = 'featureFlags.IS_AI_CHAT_INBOX_ENABLED';

const CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.conversations
    .widgets.conversations.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier,
];

// The Conversations tab and workflow inbox messages ship with the inbox under
// its flag. A workspace that had any of the three keeps all of them
@RegisteredWorkspaceCommand('2.47.0', 1791822328094)
@Command({
  name: 'upgrade:2-47:merge-ai-chat-inbox-feature-flags',
  description:
    'Fold IS_CONVERSATIONS_TAB_ENABLED and IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED into IS_AI_CHAT_INBOX_ENABLED',
})
export class MergeAiChatInboxFeatureFlagsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.moveConversationsWidgets({
      ...args,
      fromExpression: CONVERSATIONS_TAB_WIDGET_EXPRESSION,
      toExpression: AI_CHAT_INBOX_WIDGET_EXPRESSION,
    });

    if (args.options.dryRun) {
      return;
    }

    await this.coreDataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO core."featureFlag" ("workspaceId", key, value)
         SELECT $1, $2, true
         WHERE EXISTS (
           SELECT 1 FROM core."featureFlag"
           WHERE "workspaceId" = $1 AND key = ANY($3::text[]) AND value
         )
         ON CONFLICT ("key", "workspaceId") DO UPDATE SET value = true`,
        [args.workspaceId, AI_CHAT_INBOX_FLAG, MERGED_FLAGS],
      );
      await manager.query(
        `DELETE FROM core."featureFlag"
         WHERE "workspaceId" = $1 AND key = ANY($2::text[])`,
        [args.workspaceId, MERGED_FLAGS],
      );
    });

    await this.workspaceCacheService.invalidateAndRecompute(args.workspaceId, [
      'featureFlagsMap',
    ]);
  }

  // The merged flags come back with the inbox's value
  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.moveConversationsWidgets({
      ...args,
      fromExpression: AI_CHAT_INBOX_WIDGET_EXPRESSION,
      toExpression: CONVERSATIONS_TAB_WIDGET_EXPRESSION,
    });

    if (args.options.dryRun) {
      return;
    }

    await this.coreDataSource.query(
      `INSERT INTO core."featureFlag" ("workspaceId", key, value)
       SELECT inbox."workspaceId", merged_key, inbox.value
       FROM core."featureFlag" inbox, unnest($2::text[]) AS merged_key
       WHERE inbox."workspaceId" = $1 AND inbox.key = $3
       ON CONFLICT ("key", "workspaceId") DO NOTHING`,
      [args.workspaceId, MERGED_FLAGS, AI_CHAT_INBOX_FLAG],
    );

    await this.workspaceCacheService.invalidateAndRecompute(args.workspaceId, [
      'featureFlagsMap',
    ]);
  }

  // Only a widget still gated as it shipped moves, so one a workspace changed
  // keeps its expression
  private async moveConversationsWidgets({
    workspaceId,
    options,
    fromExpression,
    toExpression,
  }: RunOnWorkspaceArgs & {
    fromExpression: string;
    toExpression: string;
  }): Promise<void> {
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
        (widget) => widget.conditionalAvailabilityExpression === fromExpression,
      )
      .map((widget) => ({
        ...widget,
        conditionalAvailabilityExpression: toExpression,
        updatedAt: now,
      }));

    if (!isNonEmptyArray(widgetsToUpdate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: moving ${widgetsToUpdate.length} Conversations widget(s) to ${toExpression}`,
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
