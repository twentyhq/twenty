import { MessageChannel } from './MessageChannel';

type MessageChannelConnection = { edges: [MessageChannelEdge] };
type MessageChannelEdge = { node: MessageChannel };

export type ConnectedAccount = {
  id: string;
  handle: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  accountOwnerId: string;
  lastSyncHistoryId: string;
  messageChannels: MessageChannelConnection;
};
