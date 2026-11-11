import { useCallback, useEffect, useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_USER_LINKS_UNLINKED_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { type TeamsUserSearchOption } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';
import { parseTeamsUserSearchResponse } from 'src/features/chat/front-components/utils/parse-teams-user-search-response.util';

const UNLINKED_USERS_ERROR_MESSAGE =
  'Could not load unlinked Teams users. Please try again later.';

type UnlinkedTeamsUsersState = {
  unlinkedTeamsUsers: TeamsUserSearchOption[];
  hasMoreUnlinkedTeamsUsers: boolean;
  isUnlinkedTeamsUsersLoading: boolean;
  hasLoadedUnlinkedTeamsUsers: boolean;
  unlinkedErrorMessage: string | undefined;
  refetchUnlinkedTeamsUsers: () => Promise<void>;
};

export const useUnlinkedTeamsUsers = ({
  isEnabled,
}: {
  isEnabled: boolean;
}): UnlinkedTeamsUsersState => {
  const [unlinkedTeamsUsers, setUnlinkedTeamsUsers] = useState<
    TeamsUserSearchOption[]
  >([]);
  const [hasMoreUnlinkedTeamsUsers, setHasMoreUnlinkedTeamsUsers] =
    useState(false);
  const [isUnlinkedTeamsUsersLoading, setIsUnlinkedTeamsUsersLoading] =
    useState(true);
  const [hasLoadedUnlinkedTeamsUsers, setHasLoadedUnlinkedTeamsUsers] =
    useState(false);
  const [unlinkedErrorMessage, setUnlinkedErrorMessage] = useState<
    string | undefined
  >(undefined);
  const fetchIdRef = useRef(0);

  const refetchUnlinkedTeamsUsers = useCallback(async () => {
    fetchIdRef.current += 1;
    const fetchId = fetchIdRef.current;

    setIsUnlinkedTeamsUsersLoading(true);
    setUnlinkedErrorMessage(undefined);

    try {
      const result = await new RestApiClient().post(
        `/s${TEAMS_USER_LINKS_UNLINKED_ROUTE_PATH}`,
        {},
      );

      if (fetchId !== fetchIdRef.current) {
        return;
      }

      const { options, errorMessage } = parseTeamsUserSearchResponse(result);

      if (isDefined(errorMessage)) {
        setUnlinkedErrorMessage(errorMessage);
        setUnlinkedTeamsUsers([]);
        setHasMoreUnlinkedTeamsUsers(false);

        return;
      }

      setUnlinkedTeamsUsers(options);
      setHasMoreUnlinkedTeamsUsers(
        isDefined(result) &&
          typeof result === 'object' &&
          (result as { hasMore?: unknown }).hasMore === true,
      );
    } catch {
      if (fetchId === fetchIdRef.current) {
        setUnlinkedErrorMessage(UNLINKED_USERS_ERROR_MESSAGE);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsUnlinkedTeamsUsersLoading(false);
        setHasLoadedUnlinkedTeamsUsers(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    refetchUnlinkedTeamsUsers();
  }, [isEnabled, refetchUnlinkedTeamsUsers]);

  return {
    unlinkedTeamsUsers,
    hasMoreUnlinkedTeamsUsers,
    isUnlinkedTeamsUsersLoading,
    hasLoadedUnlinkedTeamsUsers,
    unlinkedErrorMessage,
    refetchUnlinkedTeamsUsers,
  };
};
