import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, IsNull, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { SyncMessageFoldersService } from 'src/modules/messaging/folder-sync-manager/services/sync-message-folders.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';

type MessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  'name' | 'isSynced' | 'isSentFolder' | 'externalId'
>;

@Command({
  name: 'upgrade:1-4:populate-message-folder-fields',
  description:
    'Populate isSynced, isSentFolder, and externalId fields for existing message folders. ' +
    'First populates basic fields for existing hardcoded folders, then runs sync service ' +
    'to get complete folder data with correct external IDs from email providers.',
})
export class PopulateMessageFolderFieldsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Populating message folder fields for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    try {
      const basicUpdateResult =
        await this.populateExternalIdsForHardcodedFolders(workspaceId);

      if (basicUpdateResult.failed.length > 0) {
        this.logger.warn(
          `Workspace ${workspaceId}: Basic update - Processed ${basicUpdateResult.processed}, Updated ${basicUpdateResult.updated}, Failed: ${basicUpdateResult.failed.length}`,
        );
        throw new Error(
          `Failed to update ${basicUpdateResult.failed.length} message folders`,
        );
      }

      this.logger.log(
        `Workspace ${workspaceId}: Basic update - Processed ${basicUpdateResult.processed}, Updated ${basicUpdateResult.updated} message folders`,
      );

      const syncResult = await this.syncAllMessageChannelFolders(workspaceId);

      this.logger.log(
        `Workspace ${workspaceId}: Synced folders for ${syncResult.channelsSynced} message channels`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to populate message folder fields for workspace ${workspaceId}: ${error.message}`,
      );

      throw error;
    }
  }

  private async populateExternalIdsForHardcodedFolders(
    workspaceId: string,
  ): Promise<{
    processed: number;
    updated: number;
    failed: Array<{ id: string; name: string; error: string }>;
  }> {
    const folders = await this.getFoldersNeedingMigration(workspaceId);

    if (folders.length === 0) {
      this.logger.log(
        `No message folders need updating in workspace ${workspaceId}`,
      );

      return { processed: 0, updated: 0, failed: [] };
    }

    this.logger.log(
      `Found ${folders.length} message folders to update in workspace ${workspaceId}`,
    );

    const { channelMap, channelExternalFoldersMap } =
      await this.buildChannelDataMaps(folders, workspaceId);

    return await this.updateFolderExternalIds(
      folders,
      channelMap,
      channelExternalFoldersMap,
      workspaceId,
    );
  }

  private async syncAllMessageChannelFolders(
    workspaceId: string,
  ): Promise<{ channelsSynced: number }> {
    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const channels = await messageChannelRepository.find({
      relations: ['connectedAccount'],
    });

    let channelsSynced = 0;

    for (const channel of channels) {
      try {
        const dataSource =
          await this.twentyORMGlobalManager.getDataSourceForWorkspace({
            workspaceId,
          });

        await this.syncMessageFoldersService.syncMessageFolders({
          workspaceId,
          messageChannelId: channel.id,
          manager: dataSource.manager,
        });

        this.logger.log(
          `Synced folders for message channel ${channel.id} (${channel.connectedAccount.handle})`,
        );
        channelsSynced++;
      } catch (error) {
        this.logger.warn(
          `Failed to sync folders for message channel ${channel.id}: ${error.message}`,
        );
      }
    }

    return { channelsSynced };
  }

  private async getFoldersNeedingMigration(
    workspaceId: string,
  ): Promise<MessageFolderWorkspaceEntity[]> {
    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    return await messageFolderRepository.find({
      where: [
        { externalId: IsNull() },
        { isSynced: false },
        { isSentFolder: false },
      ],
      relations: ['messageChannel'],
    });
  }

  private async buildChannelDataMaps(
    folders: MessageFolderWorkspaceEntity[],
    workspaceId: string,
  ): Promise<{
    channelMap: Map<string, MessageChannelWorkspaceEntity>;
    channelExternalFoldersMap: Map<string, MessageFolder[]>;
  }> {
    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const folderChannelIds = [
      ...new Set(folders.map((folder) => folder.messageChannelId)),
    ];

    const channels = await messageChannelRepository.find({
      where: { id: In(folderChannelIds) },
      relations: ['connectedAccount'],
    });

    const channelMap = new Map(
      channels.map((channel) => [channel.id, channel]),
    );

    const channelExternalFoldersMap = new Map<string, MessageFolder[]>();

    for (const channel of channels) {
      try {
        const externalFolders =
          await this.syncMessageFoldersService.discoverAllFolders(channel);

        channelExternalFoldersMap.set(channel.id, externalFolders);
      } catch (error) {
        this.logger.warn(
          `Failed to discover folders for channel ${channel.id}: ${error.message}`,
        );
        channelExternalFoldersMap.set(channel.id, []);
      }
    }

    return { channelMap, channelExternalFoldersMap };
  }

  private async updateFolderExternalIds(
    folders: MessageFolderWorkspaceEntity[],
    channelMap: Map<string, MessageChannelWorkspaceEntity>,
    channelExternalFoldersMap: Map<string, MessageFolder[]>,
    workspaceId: string,
  ): Promise<{
    processed: number;
    updated: number;
    failed: Array<{ id: string; name: string; error: string }>;
  }> {
    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    let updatedCount = 0;
    const failed: Array<{ id: string; name: string; error: string }> = [];

    for (const folder of folders) {
      try {
        const channel = channelMap.get(folder.messageChannelId);

        if (!channel?.connectedAccount) {
          failed.push({
            id: folder.id,
            name: folder.name,
            error: 'Connected account not found',
          });
          continue;
        }

        const externalFolders =
          channelExternalFoldersMap.get(folder.messageChannelId) || [];

        const externalId = this.findExternalIdForFolder(
          folder.name,
          externalFolders,
        );

        if (externalId === undefined) {
          continue;
        }

        await messageFolderRepository.update(folder.id, {
          isSynced:
            folder.name === MessageFolderName.INBOX ||
            folder.name === MessageFolderName.SENT_ITEMS,
          isSentFolder: folder.name === MessageFolderName.SENT_ITEMS,
          externalId,
        });

        this.logger.log(
          `Updated message folder "${folder.name}" (${folder.id}) with externalId: ${externalId}`,
        );
        updatedCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        failed.push({
          id: folder.id,
          name: folder.name,
          error: errorMessage,
        });

        this.logger.warn(
          `Failed to update message folder "${folder.name}" (${folder.id}): ${errorMessage}`,
        );
      }
    }

    this.logger.log(
      `Successfully updated ${updatedCount} message folders for workspace ${workspaceId}`,
    );

    return {
      processed: folders.length,
      updated: updatedCount,
      failed,
    };
  }

  private findExternalIdForFolder(
    folderName: string,
    externalFolders: MessageFolder[],
  ): string | null | undefined {
    if (folderName === MessageFolderName.INBOX) {
      const inboxFolder = externalFolders.find((f) => !f.isSentFolder);

      return inboxFolder?.externalId || null;
    }

    if (folderName === MessageFolderName.SENT_ITEMS) {
      const sentFolder = externalFolders.find((f) => f.isSentFolder);

      return sentFolder?.externalId || null;
    }

    return undefined;
  }
}
