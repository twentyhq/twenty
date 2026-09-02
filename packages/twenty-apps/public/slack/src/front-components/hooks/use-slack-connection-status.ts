import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

type SlackConnectionStatusState = {
  isSlackConnected: boolean;
  isConnectionStatusLoading: boolean;
};

const LOADING_STATE: SlackConnectionStatusState = {
  isSlackConnected: false,
  isConnectionStatusLoading: true,
};

export const useSlackConnectionStatus = (): SlackConnectionStatusState => {
  const [state, setState] = useState<SlackConnectionStatusState>(LOADING_STATE);

  useEffect(() => {
    let cancelled = false;

    const fetchConnectionStatus = async () => {
      let isSlackConnected = false;

      try {
        const result = await new RestApiClient().post(
          `/s${SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH}`,
          {},
        );

        isSlackConnected = asRecord(result)?.isConnected === true;
      } catch {
        isSlackConnected = false;
      }

      if (!cancelled) {
        setState({ isSlackConnected, isConnectionStatusLoading: false });
      }
    };

    fetchConnectionStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
