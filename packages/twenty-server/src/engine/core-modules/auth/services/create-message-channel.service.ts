import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type CreateMessageChannelInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  messageVisibility?: MessageChannelVisibility;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class CreateMessageChannelService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async createMessageChannel(
    input: CreateMessageChannelInput,
  ): Promise<string> {
    const {
      workspaceId,
      connectedAccountId,
      handle,
      messageVisibility,
      manager,
    } = input;

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const newMessageChannel = await messageChannelRepository.save(
      {
        id: v4(),
        connectedAccountId,
        type: MessageChannelType.EMAIL,
        handle,
        visibility:
          messageVisibility || MessageChannelVisibility.SHARE_EVERYTHING,
        syncStatus: MessageChannelSyncStatus.ONGOING,
      },
      {},
      manager,
    );

    const messageChannelMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: { nameSingular: 'messageChannel', workspaceId },
      });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'messageChannel',
      action: DatabaseEventAction.CREATED,
      events: [
        {
          recordId: newMessageChannel.id,
          objectMetadata: messageChannelMetadata,
          properties: {
            after: newMessageChannel,
          },
        },
      ],
      workspaceId,
    });

    return newMessageChannel.id;
  }
}
