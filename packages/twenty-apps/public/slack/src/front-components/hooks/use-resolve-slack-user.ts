import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_RESOLVE_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import {
  GENERIC_RESOLVE_ERROR,
  parseResolveSlackUserResult,
  type ResolveSlackUserResult,
} from 'src/front-components/utils/parse-resolve-slack-user-result.util';
import { type SlackResolveInput } from 'src/front-components/utils/to-slack-resolve-input.util';


type ResolveSlackUserState = {
  resolveSlackUser: (
    input: SlackResolveInput,
  ) => Promise<ResolveSlackUserResult>;
  isResolving: boolean;
};

export const useResolveSlackUser = (): ResolveSlackUserState => {
  // Counted, not boolean: an invalidated lookup may still be settling when
  // the next one starts, and its completion must not clear the flag early.
  const [inFlightResolveCount, setInFlightResolveCount] = useState(0);

  const resolveSlackUser = async (
    input: SlackResolveInput,
  ): Promise<ResolveSlackUserResult> => {
    setInFlightResolveCount((count) => count + 1);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_RESOLVE_ROUTE_PATH}`,
        input,
      );

      return parseResolveSlackUserResult(result);
    } catch {
      return GENERIC_RESOLVE_ERROR;
    } finally {
      setInFlightResolveCount((count) => count - 1);
    }
  };

  return { resolveSlackUser, isResolving: inFlightResolveCount > 0 };
};
