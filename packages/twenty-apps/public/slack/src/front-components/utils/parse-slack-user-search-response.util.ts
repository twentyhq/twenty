import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { toSlackResolvedUser } from 'src/front-components/utils/to-slack-resolved-user.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export type SlackUserSearchResponse = {
  options: SlackResolvedUser[];
  errorMessage: string | undefined;
};

export const FALLBACK_SEARCH_ERROR_MESSAGE =
  'Slack user search failed. Try again.';

export const parseSlackUserSearchResponse = (
  value: unknown,
): SlackUserSearchResponse => {
  const record = asRecord(value);

  if (!isDefined(record) || record.success !== true) {
    const error = record?.error;

    return {
      options: [],
      errorMessage: isNonEmptyString(error)
        ? error
        : FALLBACK_SEARCH_ERROR_MESSAGE,
    };
  }

  const slackUsers = Array.isArray(record.slackUsers) ? record.slackUsers : [];

  const options: SlackResolvedUser[] = [];

  for (const entry of slackUsers) {
    const slackUserRecord = asRecord(entry);

    const option = isDefined(slackUserRecord)
      ? toSlackResolvedUser({
          record: slackUserRecord,
          isInInstalledWorkspace: true,
        })
      : undefined;

    if (!isDefined(option) || !isNonEmptyString(option.slackTeamId)) {
      continue;
    }

    options.push(option);
  }

  return { options, errorMessage: undefined };
};
