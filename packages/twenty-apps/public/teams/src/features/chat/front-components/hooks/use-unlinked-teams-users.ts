import { useCallback, useEffect, useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_USER_LINKS_UNLINKED_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import {
  type TeamsUnlinkedUsersResult,
  type TeamsUserSearchOption,
} from 'src/features/chat/logic-functions/types/teams-user-search-option.type';

const UNLINKED_USERS_ERROR_MESSAGE =
  'Could not load unlinked Teams users. Please try again later.';

type UnlinkedTeamsUsersState = {
  unlinkedTeamsUsers: TeamsUserSearchOption[];
  hasMoreUnlinkedTeamsUsers: boolean;
  isUnlinkedTeamsUsersLoading: boolean;
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
      const result = await new RestApiClient().post<
        TeamsUnlinkedUsersResult | undefined
      >(`/s${TEAMS_USER_LINKS_UNLINKED_ROUTE_PATH}`, {});

      if (fetchId !== fetchIdRef.current) {
        return;
      }

      if (!isDefined(result) || !result.success) {
        setUnlinkedErrorMessage(result?.error ?? UNLINKED_USERS_ERROR_MESSAGE);
        setUnlinkedTeamsUsers([]);
        setHasMoreUnlinkedTeamsUsers(false);

        return;
      }

      setUnlinkedTeamsUsers(result.teamsUsers);
      setHasMoreUnlinkedTeamsUsers(result.hasMore);
    } catch {
      if (fetchId === fetchIdRef.current) {
        setUnlinkedErrorMessage(UNLINKED_USERS_ERROR_MESSAGE);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsUnlinkedTeamsUsersLoading(false);
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
    unlinkedErrorMessage,
    refetchUnlinkedTeamsUsers,
  };
};
