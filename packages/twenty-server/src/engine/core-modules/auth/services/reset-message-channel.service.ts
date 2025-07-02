import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type ResetMessageChannelsInput = {
  workspaceId: string;
  connectedAccountId: string;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class ResetMessageChannelService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async resetMessageChannels(input: ResetMessageChannelsInput): Promise<void> {
    const { workspaceId, connectedAccountId, manager } = input;

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.find({
      where: { connectedAccountId },
    });

    const messageChannelUpdates = await messageChannelRepository.update(
      {
        connectedAccountId,
      },
      {
        syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
        syncStatus: MessageChannelSyncStatus.ONGOING,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      manager,
    );

    const messageChannelMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: { nameSingular: 'messageChannel', workspaceId },
      });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'messageChannel',
      action: DatabaseEventAction.UPDATED,
      events: messageChannels.map((messageChannel) => ({
        recordId: messageChannel.id,
        objectMetadata: messageChannelMetadata,
        properties: {
          before: messageChannel,
          after: { ...messageChannel, ...messageChannelUpdates.raw[0] },
        },
      })),
      workspaceId,
    });

    return;
  }
}
