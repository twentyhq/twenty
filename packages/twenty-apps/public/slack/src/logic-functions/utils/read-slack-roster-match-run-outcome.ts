import { kv } from 'twenty-sdk/logic-function';

import { SLACK_ROSTER_MATCH_RUN_OUTCOME_KV_KEY } from 'src/logic-functions/constants/slack-roster-match-run-outcome-kv-key';
import { type SlackRosterMatchRunOutcome } from 'src/logic-functions/types/slack-roster-match-run-outcome.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

export const readSlackRosterMatchRunOutcome = async (): Promise<
  SlackRosterMatchRunOutcome | undefined
> => {
  try {
    const record = asRecord(
      await kv.get(SLACK_ROSTER_MATCH_RUN_OUTCOME_KV_KEY),
    );

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
