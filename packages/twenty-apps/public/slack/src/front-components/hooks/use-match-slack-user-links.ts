import { useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_MATCH_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { type SlackRosterMatchOutcome } from 'src/front-components/types/slack-roster-match-outcome.type';
import { parseSlackRosterMatchResult } from 'src/front-components/utils/parse-slack-roster-match-result.util';

const FALLBACK_MATCH_ERROR_MESSAGE =
  'Could not match Slack users. Please try again.';

const buildFailureOutcome = (error: string): SlackRosterMatchOutcome => ({
  success: false,
  message: FALLBACK_MATCH_ERROR_MESSAGE,
  error,
  linkedCount: 0,
  unmatchedCount: 0,
  failedCount: 0,
});

export const useMatchSlackUserLinks = () => {
  const isMatchingRef = useRef(false);
  const [isMatching, setIsMatching] = useState(false);

  const matchSlackUserLinks = async (): Promise<SlackRosterMatchOutcome> => {
    if (isMatchingRef.current) {
      return buildFailureOutcome('A match is already running.');
    }

    isMatchingRef.current = true;
    setIsMatching(true);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_MATCH_ROUTE_PATH}`,
        {},
      );

      return parseSlackRosterMatchResult({
        value: result,
        fallbackMessage: FALLBACK_MATCH_ERROR_MESSAGE,
      });
    } catch {
      return buildFailureOutcome(FALLBACK_MATCH_ERROR_MESSAGE);
    } finally {
      isMatchingRef.current = false;
      setIsMatching(false);
    }
  };

  return { matchSlackUserLinks, isMatching };
};
