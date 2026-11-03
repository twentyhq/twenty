import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { doNotTranslate } from 'twenty-shared/i18n';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.56.0', 1793639083813)
@Command({
  name: 'upgrade:2-56:enable-direct-message-pair-identity',
  description: doNotTranslate(
    'Enable direct message pair identity after its storage upgrade',
  ),
})
export class EnableDirectMessagePairIdentityCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(FeatureFlagService)
  private readonly featureFlagService: FeatureFlagService;

  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatIndexMaps'],
    );
    const pairIndex =
      flatIndexMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.indexes.directMessagePairUniqueIndex
          .universalIdentifier
      ];

    if (!isDefined(pairIndex)) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        doNotTranslate(
          `[DRY RUN] Would enable direct message pair identity for workspace ${workspaceId}`,
        ),
      );

      return;
    }

    await this.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId,
      featureFlag: FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
      value: true,
    });
  }
}
