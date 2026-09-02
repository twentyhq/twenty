import { kv } from 'twenty-sdk/logic-function';

import { SLACK_ROSTER_MATCH_OUTCOME_KV_KEY } from 'src/logic-functions/constants/slack-roster-match-outcome-kv-key';
import { type SlackRosterMatchOutcome } from 'src/logic-functions/types/slack-roster-match-outcome.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

export const readSlackRosterMatchOutcome = async (): Promise<
  SlackRosterMatchOutcome | undefined
> => {
  try {
    const record = asRecord(await kv.get(SLACK_ROSTER_MATCH_OUTCOME_KV_KEY));

    if (typeof record?.isSuccessful !== 'boolean') {
      return undefined;
    }

    return {
      isSuccessful: record.isSuccessful,
      errorMessage: readOptionalString(record.errorMessage),
    };
  } catch {
    return undefined;
  }
};
