import { isNonEmptyString } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';

export type ParsedSlackConnectionStatus = {
  isSlackConnected: boolean;
  installedSlackTeamId: string | undefined;
};

export const DISCONNECTED_SLACK_CONNECTION_STATUS: ParsedSlackConnectionStatus =
  {
    isSlackConnected: false,
    installedSlackTeamId: undefined,
  };

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
  };
};
