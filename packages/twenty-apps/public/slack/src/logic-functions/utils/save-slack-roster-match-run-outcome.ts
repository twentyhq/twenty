import { kv } from 'twenty-sdk/logic-function';

import { SLACK_ROSTER_MATCH_RUN_OUTCOME_KV_KEY } from 'src/logic-functions/constants/slack-roster-match-run-outcome-kv-key';
import { type SlackRosterMatchRunOutcome } from 'src/logic-functions/types/slack-roster-match-run-outcome.type';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const saveSlackRosterMatchRunOutcome = async (
  outcome: SlackRosterMatchRunOutcome,
): Promise<void> => {
  try {
    await kv.set(SLACK_ROSTER_MATCH_RUN_OUTCOME_KV_KEY, outcome);
  } catch (error) {
    console.warn(
      `[slack] failed to record the roster match outcome: ${toErrorMessage(error)}`,
    );
  }
};
