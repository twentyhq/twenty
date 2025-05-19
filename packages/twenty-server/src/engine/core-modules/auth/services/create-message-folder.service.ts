import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
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
  ) {}

  async createMessageFolders(input: CreateMessageFoldersInput): Promise<void> {
    const { workspaceId, messageChannelId, manager } = input;

    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    await messageFolderRepository.save(
      {
        id: v4(),
        messageChannelId,
        name: MessageFolderName.INBOX,
        syncCursor: '',
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
      },
      {},
      manager,
    );
  }
}
