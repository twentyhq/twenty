import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TEAMS_USER_LINKS_MATCH_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { type TeamsDirectoryMatchResult } from 'src/features/chat/logic-functions/types/teams-directory-match.type';

const FALLBACK_MATCH_ERROR_RESULT: TeamsDirectoryMatchResult = {
  success: false,
  message: 'Could not match Teams users',
  error: 'The request failed. Please try again.',
};

type MatchTeamsUserLinksState = {
  matchTeamsUserLinks: () => Promise<TeamsDirectoryMatchResult>;
  isMatching: boolean;
};

export const useMatchTeamsUserLinks = (): MatchTeamsUserLinksState => {
  const [isMatching, setIsMatching] = useState(false);

  const matchTeamsUserLinks = async (): Promise<TeamsDirectoryMatchResult> => {
    setIsMatching(true);

    try {
      const result = await new RestApiClient().post<
        TeamsDirectoryMatchResult | undefined
      >(`/s${TEAMS_USER_LINKS_MATCH_ROUTE_PATH}`, {});

      return result ?? FALLBACK_MATCH_ERROR_RESULT;
    } catch (error) {
      console.error('Teams match user links request failed', error);

      return FALLBACK_MATCH_ERROR_RESULT;
    } finally {
      setIsMatching(false);
    }
  };

  return { matchTeamsUserLinks, isMatching };
};
