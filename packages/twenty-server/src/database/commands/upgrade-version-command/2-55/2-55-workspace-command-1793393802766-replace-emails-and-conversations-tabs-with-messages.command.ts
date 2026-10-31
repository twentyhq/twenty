import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMessagesTabMigration } from 'src/database/commands/upgrade-version-command/2-55/utils/build-messages-tab-migration.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.55.0', 1793393802766)
@Command({
  name: 'upgrade:2-55:replace-emails-and-conversations-tabs-with-messages',
  description:
    'Rename the standard Emails record tab to Messages and remove the standard Conversations tab',
})
export class ReplaceEmailsAndConversationsTabsWithMessagesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    const {
      pageLayoutTabsToUpdate,
      pageLayoutWidgetsToUpdate,
      pageLayoutTabsToDelete,
      pageLayoutWidgetsToDelete,
    } = buildMessagesTabMigration({
      flatPageLayoutTabsByUniversalIdentifier:
        flatPageLayoutTabMaps.byUniversalIdentifier,
      flatPageLayoutWidgetsByUniversalIdentifier:
        flatPageLayoutWidgetMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
    });

    const operationCount =
      pageLayoutTabsToUpdate.length +
      pageLayoutWidgetsToUpdate.length +
      pageLayoutTabsToDelete.length +
      pageLayoutWidgetsToDelete.length;

    if (operationCount === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: renaming ${pageLayoutTabsToUpdate.length} tab(s) and ${pageLayoutWidgetsToUpdate.length} widget(s) to Messages, removing ${pageLayoutTabsToDelete.length} Conversations tab(s) and ${pageLayoutWidgetsToDelete.length} widget(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutTabsToDelete,
              flatEntityToUpdate: pageLayoutTabsToUpdate,
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutWidgetsToDelete,
              flatEntityToUpdate: pageLayoutWidgetsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
