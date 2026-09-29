import { isArray } from '@sniptt/guards';

import { TEAMS_CHANNEL_ID } from 'src/features/chat/logic-functions/constants/teams-channel-id';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';

export const isTeamsEndorsedKey = (key: TeamsBotConnectorKey): boolean =>
  isArray(key.endorsements) && key.endorsements.includes(TEAMS_CHANNEL_ID);
