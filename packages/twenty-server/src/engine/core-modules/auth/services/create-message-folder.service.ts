import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';

export type CreateMessageFoldersInput = {
  workspaceId: string;
  messageChannelId: string;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class CreateMessageFolderService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly featureFlagService: FeatureFlagService,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
  ) {}

  async createMessageFolders(input: CreateMessageFoldersInput): Promise<void> {
    const { workspaceId, messageChannelId, manager } = input;

    const isFolderControlEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_FOLDER_CONTROL_ENABLED,
        workspaceId,
      );

    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    if (isFolderControlEnabled) {
      await this.syncMessageFoldersService.syncMessageFolders({
        workspaceId,
        messageChannelId,
        manager,
      });

      return;
    }

    await messageFolderRepository.save(
      {
        id: v4(),
        messageChannelId,
        name: MessageFolderName.INBOX,
        syncCursor: '',
        isSynced: true,
        isSentFolder: false,
      },
      {},
      manager,
    );

    await messageFolderRepository.save(
      {
        id: v4(),
        messageChannelId,
        name: MessageFolderName.SENT_ITEMS,
        syncCursor: '',
        isSynced: true,
        isSentFolder: true,
      },
      {},
      manager,
    );
  }
}
