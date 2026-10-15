import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TEAMS_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { type TeamsUserLinkActionResult } from 'src/features/chat/logic-functions/types/teams-user-link-action-result.type';

export const useRemoveTeamsUserLink = () => {
  const [removingLinkId, setRemovingLinkId] = useState<string | undefined>(
    undefined,
  );

  const removeTeamsUserLink = async (id: string): Promise<boolean> => {
    setRemovingLinkId(id);

    try {
      const result = await new RestApiClient().post<
        TeamsUserLinkActionResult | undefined
      >(`/s${TEAMS_USER_LINKS_REMOVE_ROUTE_PATH}`, { id });

      return result?.success ?? false;
    } catch {
      return false;
    } finally {
      setRemovingLinkId(undefined);
    }
  };

  return { removeTeamsUserLink, removingLinkId };
};
