import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TEAMS_USER_LINKS_SET_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { type TeamsSetUserLinkInput } from 'src/features/chat/logic-functions/types/teams-set-user-link-input.type';
import { type TeamsUserLinkActionResult } from 'src/features/chat/logic-functions/types/teams-user-link-action-result.type';

const FALLBACK_MESSAGE = 'Could not save the link';

const GENERIC_ERROR_RESULT: TeamsUserLinkActionResult = {
  success: false,
  message: FALLBACK_MESSAGE,
  error: 'The request failed. Please try again.',
};

type SetTeamsUserLinkState = {
  setTeamsUserLink: (
    input: TeamsSetUserLinkInput,
  ) => Promise<TeamsUserLinkActionResult>;
  isSubmitting: boolean;
};

export const useSetTeamsUserLink = (): SetTeamsUserLinkState => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setTeamsUserLink = async (
    input: TeamsSetUserLinkInput,
  ): Promise<TeamsUserLinkActionResult> => {
    setIsSubmitting(true);

    try {
      const result = await new RestApiClient().post<
        TeamsUserLinkActionResult | undefined
      >(`/s${TEAMS_USER_LINKS_SET_ROUTE_PATH}`, input);

      return result ?? GENERIC_ERROR_RESULT;
    } catch (error) {
      console.error('Teams set user link request failed', error);

      return GENERIC_ERROR_RESULT;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { setTeamsUserLink, isSubmitting };
};
