import { type SlackConnectionHealth } from 'src/logic-functions/constants/slack-connection-health';

export type ParsedSlackConnectionStatus = {
  isSlackConnected: boolean;
  installedSlackTeamId: string | undefined;
  connectionHealth: SlackConnectionHealth | undefined;
  hasRosterMatchFailed: boolean;
};
