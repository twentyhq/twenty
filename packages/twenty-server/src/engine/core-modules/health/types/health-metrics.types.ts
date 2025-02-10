import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type MessageChannelSyncJobByStatusCounter = {
  [key in MessageChannelSyncStatus]?: number;
};
