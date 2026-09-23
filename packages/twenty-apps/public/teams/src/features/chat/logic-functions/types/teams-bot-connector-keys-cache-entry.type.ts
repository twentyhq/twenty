import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';

export type TeamsBotConnectorKeysCacheEntry = {
  keys: TeamsBotConnectorKey[];
  fetchedAtMs: number;
};
