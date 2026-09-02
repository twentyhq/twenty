import {
  SLACK_CONNECTION_HEALTH,
  type SlackConnectionHealth,
} from 'src/logic-functions/constants/slack-connection-health';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export type ParsedSlackConnectionStatus = {
  isSlackConnected: boolean;
  connectionHealth: SlackConnectionHealth | undefined;
  hasRosterMatchFailed: boolean;
};

const KNOWN_HEALTH_VALUES: string[] = Object.values(SLACK_CONNECTION_HEALTH);

const isSlackConnectionHealth = (
  value: unknown,
): value is SlackConnectionHealth =>
  typeof value === 'string' && KNOWN_HEALTH_VALUES.includes(value);

export const parseSlackConnectionStatus = (
  result: unknown,
): ParsedSlackConnectionStatus => {
  const record = asRecord(result);

  return {
    isSlackConnected: record?.isConnected === true,
    connectionHealth: isSlackConnectionHealth(record?.connectionHealth)
      ? record.connectionHealth
      : undefined,
    hasRosterMatchFailed: record?.hasRosterMatchFailed === true,
  };
};
