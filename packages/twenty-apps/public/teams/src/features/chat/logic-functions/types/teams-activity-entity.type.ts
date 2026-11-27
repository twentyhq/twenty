import { type TeamsChannelAccount } from 'src/features/chat/logic-functions/types/teams-channel-account.type';

export type TeamsActivityEntity = {
  type?: string;
  text?: string;
  mentioned?: TeamsChannelAccount;
  streamId?: string;
  streamType?: 'informative' | 'streaming' | 'final';
  streamSequence?: number;
};
