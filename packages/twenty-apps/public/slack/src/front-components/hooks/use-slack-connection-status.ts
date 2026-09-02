import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import {
  type ParsedSlackConnectionStatus,
  parseSlackConnectionStatus,
} from 'src/front-components/utils/parse-slack-connection-status.util';

type SlackConnectionStatusState = ParsedSlackConnectionStatus & {
  isConnectionStatusLoading: boolean;
};

const LOADING_STATE: SlackConnectionStatusState = {
  isSlackConnected: false,
  connectionHealth: undefined,
  hasRosterMatchFailed: false,
  isConnectionStatusLoading: true,
};

const DISCONNECTED_STATUS: ParsedSlackConnectionStatus = {
  isSlackConnected: false,
  connectionHealth: undefined,
  hasRosterMatchFailed: false,
};

export const useSlackConnectionStatus = (): SlackConnectionStatusState => {
  const [state, setState] = useState<SlackConnectionStatusState>(LOADING_STATE);

  useEffect(() => {
    let cancelled = false;

    const fetchConnectionStatus = async () => {
      let status: ParsedSlackConnectionStatus;

      try {
        const result = await new RestApiClient().post(
          `/s${SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH}`,
          {},
        );

        status = parseSlackConnectionStatus(result);
      } catch {
        status = DISCONNECTED_STATUS;
      }

      if (!cancelled) {
        setState({ ...status, isConnectionStatusLoading: false });
      }
    };

    fetchConnectionStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
