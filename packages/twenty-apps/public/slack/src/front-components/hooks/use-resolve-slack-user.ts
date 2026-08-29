import { isBoolean, isString } from '@sniptt/guards';
import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINKS_RESOLVE_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { asRecord } from 'src/front-components/utils/as-record.util';
import { type SlackResolveInput } from 'src/front-components/utils/to-slack-resolve-input.util';
import { toSlackResolvedUser } from 'src/front-components/utils/to-slack-resolved-user.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

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

  const slackUserRecord = asRecord(record.slackUser);

  const resolvedUser =
    slackUserRecord === undefined
      ? undefined
      : toSlackResolvedUser({
          record: slackUserRecord,
          isInInstalledWorkspace:
            slackUserRecord.isInInstalledWorkspace === true,
        });

  if (!isDefined(resolvedUser)) {
    return GENERIC_ERROR;
  }

  return { success: true, slackUser: resolvedUser };
};

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

      return parseResult(result);
    } catch {
      return GENERIC_ERROR;
    } finally {
      setInFlightResolveCount((count) => count - 1);
    }
  };

  return { resolveSlackUser, isResolving: inFlightResolveCount > 0 };
};
