import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

@RegisteredWorkspaceCommand('2.57.0', 1794061333000)
@Command({
  name: 'upgrade:2-57:refresh-outlook-drafts',
  description:
    'Queue stored Outlook drafts for a refresh, so drafts Outlook already sent stop showing as drafts',
})
export class RefreshOutlookDraftsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping Outlook drafts refresh`,
      );

      return;
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: {
        workspaceId,
        isSyncEnabled: true,
        connectedAccount: { provider: ConnectedAccountProvider.MICROSOFT },
      },
    });

    for (const messageChannel of messageChannels) {
      const draftExternalIds = await this.findDraftExternalIds({
        dataSource,
        workspaceId,
        messageChannelId: messageChannel.id,
      });

      if (draftExternalIds.length === 0) {
        continue;
      }

      if (
        messageChannel.syncStage !==
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING
      ) {
        this.logger.warn(
          `Workspace ${workspaceId}: skipping busy message channel ${messageChannel.id} (${messageChannel.syncStage}), ${draftExternalIds.length} drafts not refreshed`,
        );

        continue;
      }

      this.logger.log(
        `${options.dryRun ? '[DRY RUN] Would refresh' : 'Refreshing'} ${draftExternalIds.length} drafts of message channel ${messageChannel.id} in workspace ${workspaceId}`,
      );

      if (options.dryRun) {
        continue;
      }

      await this.cacheStorage.setAdd(
        `messages-to-import:${workspaceId}:${messageChannel.id}`,
        draftExternalIds,
        ONE_WEEK_IN_MILLISECONDS,
      );

      const { affected } = await this.messageChannelRepository.update(
        {
          id: messageChannel.id,
          workspaceId,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        },
        { syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING },
      );

      if (affected === 0) {
        this.logger.warn(
          `Workspace ${workspaceId}: message channel ${messageChannel.id} started syncing, ${draftExternalIds.length} drafts may not be refreshed`,
        );
      }
    }
  }

  private async findDraftExternalIds({
    dataSource,
    workspaceId,
    messageChannelId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    messageChannelId: string;
  }): Promise<string[]> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const rows: { messageExternalId: string }[] = await dataSource.query(
      `SELECT association."messageExternalId"
       FROM "${schemaName}"."messageChannelMessageAssociation" association
       JOIN "${schemaName}"."message" message ON message.id = association."messageId"
       WHERE association."messageChannelId" = $1
         AND association."messageExternalId" IS NOT NULL
         AND association."deletedAt" IS NULL
         AND message."isDraft" = TRUE
         AND message."deletedAt" IS NULL`,
      [messageChannelId],
    );

    return rows.map(({ messageExternalId }) => messageExternalId);
  }
}
