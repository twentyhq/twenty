import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildMissingAgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-missing-agent-chat-channel-views-to-create.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.64.0', 1795619804236)
@Command({
  name: 'upgrade:2-64:add-inbox-channel-views',
  description:
    'Add the Open, Snoozed and Done inbox thread views of every existing inbox channel',
})
export class AddInboxChannelViewsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatObjectMetadataMaps,
      flatAgentChatChannelMaps,
      flatViewMaps,
      flatViewFilterMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatAgentChatChannelMaps',
      'flatViewMaps',
      'flatViewFilterMaps',
    ]);

    const hasInboxThreadObject = isDefined(
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      }),
    );

    if (!hasInboxThreadObject) {
      this.logger.log(
        `Inbox thread object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { viewsToCreate, viewFiltersToCreate } =
      buildMissingAgentChatChannelViewsToCreate({
        channelIds: Object.values(flatAgentChatChannelMaps.byUniversalIdentifier)
          .filter(isDefined)
          .map(({ id }) => id),
        flatViewMaps,
        flatViewFilterMaps,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    if (viewsToCreate.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${viewsToCreate.length} inbox channel view(s) to create`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          shouldDeferActions: false,
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFilter: {
              flatEntityToCreate: viewFiltersToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add the inbox channel views for workspace ${workspaceId}`,
      );
    }
  }
}
