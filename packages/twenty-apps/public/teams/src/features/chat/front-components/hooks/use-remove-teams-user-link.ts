import { isBoolean } from '@sniptt/guards';
import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TEAMS_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { type TeamsUserLinkActionResult } from 'src/features/chat/logic-functions/types/teams-user-link-action-result.type';

const REMOVE_FAILED_RESULT: TeamsUserLinkActionResult = {
  success: false,
  message: 'Could not remove the link',
  error: 'The request failed. Please try again.',
};

export const useRemoveTeamsUserLink = () => {
  const [removingLinkId, setRemovingLinkId] = useState<string | undefined>(
    undefined,
  );

  const removeTeamsUserLink = async (
    id: string,
  ): Promise<TeamsUserLinkActionResult> => {
    setRemovingLinkId(id);

    try {
      const result = await new RestApiClient().post<
        TeamsUserLinkActionResult | undefined
      >(`/s${TEAMS_USER_LINKS_REMOVE_ROUTE_PATH}`, { id });

      return isBoolean(result?.success) ? result : REMOVE_FAILED_RESULT;
    } catch {
      return REMOVE_FAILED_RESULT;
    } finally {
      setRemovingLinkId(undefined);
    }
  };

  return { removeTeamsUserLink, removingLinkId };
};
