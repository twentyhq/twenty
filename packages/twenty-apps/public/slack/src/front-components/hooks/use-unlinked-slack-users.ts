import { useCallback, useEffect, useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINKS_UNLINKED_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { parseSlackUserSearchResponse } from 'src/front-components/utils/parse-slack-user-search-response.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

const UNLINKED_USERS_ERROR_MESSAGE =
  'Could not load unlinked Slack users. Please try again later.';

type UnlinkedSlackUsersState = {
  unlinkedSlackUsers: SlackResolvedUser[];
  hasMoreUnlinkedSlackUsers: boolean;
  isUnlinkedSlackUsersLoading: boolean;
  unlinkedErrorMessage: string | undefined;
  refetchUnlinkedSlackUsers: () => Promise<void>;
};

export const useUnlinkedSlackUsers = ({
  isEnabled,
}: {
  isEnabled: boolean;
}): UnlinkedSlackUsersState => {
  const [unlinkedSlackUsers, setUnlinkedSlackUsers] = useState<
    SlackResolvedUser[]
  >([]);
  const [hasMoreUnlinkedSlackUsers, setHasMoreUnlinkedSlackUsers] =
    useState(false);
  const [isUnlinkedSlackUsersLoading, setIsUnlinkedSlackUsersLoading] =
    useState(true);
  const [unlinkedErrorMessage, setUnlinkedErrorMessage] = useState<
    string | undefined
  >(undefined);
  const fetchIdRef = useRef(0);

  const refetchUnlinkedSlackUsers = useCallback(async () => {
    fetchIdRef.current += 1;
    const fetchId = fetchIdRef.current;

    setIsUnlinkedSlackUsersLoading(true);
    setUnlinkedErrorMessage(undefined);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_UNLINKED_ROUTE_PATH}`,
        {},
      );

      if (fetchId !== fetchIdRef.current) {
        return;
      }

      const { options, errorMessage } = parseSlackUserSearchResponse(result);

      if (isDefined(errorMessage)) {
        setUnlinkedErrorMessage(errorMessage);
        setUnlinkedSlackUsers([]);
        setHasMoreUnlinkedSlackUsers(false);

        return;
      }

      setUnlinkedSlackUsers(options);
      setHasMoreUnlinkedSlackUsers(asRecord(result)?.hasMore === true);
    } catch {
      if (fetchId === fetchIdRef.current) {
        setUnlinkedErrorMessage(UNLINKED_USERS_ERROR_MESSAGE);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsUnlinkedSlackUsersLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    refetchUnlinkedSlackUsers();
  }, [isEnabled, refetchUnlinkedSlackUsers]);

  return {
    unlinkedSlackUsers,
    hasMoreUnlinkedSlackUsers,
    isUnlinkedSlackUsersLoading,
    unlinkedErrorMessage,
    refetchUnlinkedSlackUsers,
  };
};
