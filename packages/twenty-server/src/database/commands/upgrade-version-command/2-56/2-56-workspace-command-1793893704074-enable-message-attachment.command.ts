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

@RegisteredWorkspaceCommand('2.56.0', 1793893704074)
@Command({
  name: 'upgrade:2-56:enable-message-attachment',
  description: doNotTranslate(
    'Enable message attachments after the message attachment target upgrade',
  ),
})
export class EnableMessageAttachmentCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const isMessageAttachmentTargetCreated = [
      STANDARD_OBJECTS.attachment.fields.targetMessage.universalIdentifier,
      STANDARD_OBJECTS.message.fields.attachments.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier]),
    );

    if (!isMessageAttachmentTargetCreated) {
      this.logger.warn(
        doNotTranslate(
          `Message attachment target missing for workspace ${workspaceId}, leaving message attachments disabled`,
        ),
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        doNotTranslate(
          `[DRY RUN] Would enable message attachments for workspace ${workspaceId}`,
        ),
      );

      return;
    }

    await this.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId,
      featureFlag: FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
      value: true,
    });
  }
}
