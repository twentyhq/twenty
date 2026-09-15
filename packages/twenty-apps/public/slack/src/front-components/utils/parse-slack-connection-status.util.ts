import { isNonEmptyString } from '@sniptt/guards';

import { type ParsedSlackConnectionStatus } from 'src/front-components/types/parsed-slack-connection-status.type';
import {
  SLACK_CONNECTION_HEALTH,
  type SlackConnectionHealth,
} from 'src/logic-functions/constants/slack-connection-health';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export const DISCONNECTED_SLACK_CONNECTION_STATUS: ParsedSlackConnectionStatus =
  {
    isSlackConnected: false,
    installedSlackTeamId: undefined,
    connectionHealth: undefined,
    hasRosterMatchFailed: false,
  };

const KNOWN_HEALTH_VALUES: string[] = Object.values(SLACK_CONNECTION_HEALTH);

const isSlackConnectionHealth = (
  value: unknown,
): value is SlackConnectionHealth =>
  typeof value === 'string' && KNOWN_HEALTH_VALUES.includes(value);

export const parseSlackConnectionStatus = (
  value: unknown,
): ParsedSlackConnectionStatus => {
  const record = asRecord(value);

  if (record?.isConnected !== true) {
    return DISCONNECTED_SLACK_CONNECTION_STATUS;
  }

  const installedSlackTeamId = record.installedSlackTeamId;

  return {
    isSlackConnected: true,
    installedSlackTeamId: isNonEmptyString(installedSlackTeamId)
      ? installedSlackTeamId
      : undefined,
    connectionHealth: isSlackConnectionHealth(record.connectionHealth)
      ? record.connectionHealth
      : undefined,
    hasRosterMatchFailed: record.hasRosterMatchFailed === true,
  };
};
