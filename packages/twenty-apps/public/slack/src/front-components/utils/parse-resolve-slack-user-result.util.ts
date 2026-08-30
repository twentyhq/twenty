import { isBoolean, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { toSlackResolvedUser } from 'src/front-components/utils/to-slack-resolved-user.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

export type ResolveSlackUserResult =
  | { success: true; slackUser: SlackResolvedUser }
  | { success: false; error: string };

export const GENERIC_RESOLVE_ERROR: ResolveSlackUserResult = {
  success: false,
  error: 'Could not resolve that Slack user. Please try again.',
};

export const parseResolveSlackUserResult = (
  value: unknown,
): ResolveSlackUserResult => {
  const record = asRecord(value);

  if (record === undefined || !isBoolean(record.success)) {
    return GENERIC_RESOLVE_ERROR;
  }

  if (!record.success) {
    return {
      success: false,
      error: isString(record.error)
        ? record.error
        : isString(record.message)
          ? record.message
          : GENERIC_RESOLVE_ERROR.error,
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
    return GENERIC_RESOLVE_ERROR;
  }

  return { success: true, slackUser: resolvedUser };
};
