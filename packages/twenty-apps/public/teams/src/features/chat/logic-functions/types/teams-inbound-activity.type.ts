import { type TeamsActivityEntity } from 'src/features/chat/logic-functions/types/teams-activity-entity.type';
import { type TeamsChannelAccount } from 'src/features/chat/logic-functions/types/teams-channel-account.type';

export type TeamsInboundActivity = {
  type?: string;
  id?: string;
  text?: string;
  from?: TeamsChannelAccount;
  recipient?: TeamsChannelAccount;
  conversation?: {
    id?: string;
    conversationType?: string;
  };
  entities?: TeamsActivityEntity[];
};
