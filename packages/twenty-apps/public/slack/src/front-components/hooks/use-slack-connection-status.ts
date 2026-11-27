import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { type ParsedSlackConnectionStatus } from 'src/front-components/types/parsed-slack-connection-status.type';
import {
  DISCONNECTED_SLACK_CONNECTION_STATUS,
  FAILED_SLACK_CONNECTION_STATUS,
  parseSlackConnectionStatus,
} from 'src/front-components/utils/parse-slack-connection-status.util';

type SlackConnectionStatusState = ParsedSlackConnectionStatus & {
  isConnectionStatusLoading: boolean;
};

const LOADING_STATE: SlackConnectionStatusState = {
  ...DISCONNECTED_SLACK_CONNECTION_STATUS,
  isConnectionStatusLoading: true,
};

const fetchSlackConnectionStatus =
  async (): Promise<ParsedSlackConnectionStatus> => {
    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH}`,
        {},
      );

      return parseSlackConnectionStatus(result);
    } catch {
      return FAILED_SLACK_CONNECTION_STATUS;
    }
  };

export const useSlackConnectionStatus = (): SlackConnectionStatusState => {
  const [state, setState] = useState<SlackConnectionStatusState>(LOADING_STATE);

  useEffect(() => {
    let cancelled = false;

    const fetchConnectionStatus = async () => {
      const connectionStatus = await fetchSlackConnectionStatus();

      if (!cancelled) {
        setState({ ...connectionStatus, isConnectionStatusLoading: false });
      }
    };

    fetchConnectionStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
