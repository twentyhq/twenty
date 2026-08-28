import { isBoolean, isNonEmptyString, isString } from '@sniptt/guards';
import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_RESOLVE_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { asRecord } from 'src/front-components/utils/as-record.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

type ResolveInput = {
  email?: string;
  slackUserId?: string;
  slackTeamId?: string;
};

export type ResolveSlackUserResult =
  | { success: true; slackUser: SlackResolvedUser }
  | { success: false; error: string };

const GENERIC_ERROR: ResolveSlackUserResult = {
  success: false,
  error: 'Could not resolve that Slack user. Please try again.',
};

const parseResult = (value: unknown): ResolveSlackUserResult => {
  const record = asRecord(value);

  if (record === undefined || !isBoolean(record.success)) {
    return GENERIC_ERROR;
  }

  if (!record.success) {
    return {
      success: false,
      error: isString(record.error)
        ? record.error
        : isString(record.message)
          ? record.message
          : GENERIC_ERROR.error,
    };
  }

  const slackUser = asRecord(record.slackUser);

  if (slackUser === undefined || !isNonEmptyString(slackUser.slackUserId)) {
    return GENERIC_ERROR;
  }

  return {
    success: true,
    slackUser: {
      slackUserId: slackUser.slackUserId,
      slackTeamId: isString(slackUser.slackTeamId) ? slackUser.slackTeamId : '',
      displayName: isNonEmptyString(slackUser.displayName)
        ? slackUser.displayName
        : undefined,
      email: isNonEmptyString(slackUser.email) ? slackUser.email : undefined,
      isInInstalledWorkspace: slackUser.isInInstalledWorkspace === true,
    },
  };
};

type ResolveSlackUserState = {
  resolveSlackUser: (input: ResolveInput) => Promise<ResolveSlackUserResult>;
  isResolving: boolean;
};

export const useResolveSlackUser = (): ResolveSlackUserState => {
  // Counted, not boolean: an invalidated lookup may still be settling when
  // the next one starts, and its completion must not clear the flag early.
  const [inFlightResolveCount, setInFlightResolveCount] = useState(0);

  const resolveSlackUser = async (
    input: ResolveInput,
  ): Promise<ResolveSlackUserResult> => {
    setInFlightResolveCount((count) => count + 1);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_RESOLVE_ROUTE_PATH}`,
        input,
      );

      return parseResult(result);
    } catch {
      return GENERIC_ERROR;
    } finally {
      setInFlightResolveCount((count) => count - 1);
    }
  };

  return { resolveSlackUser, isResolving: inFlightResolveCount > 0 };
};
