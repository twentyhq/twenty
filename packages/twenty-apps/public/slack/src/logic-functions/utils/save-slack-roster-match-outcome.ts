import { kv } from 'twenty-sdk/logic-function';

import { SLACK_ROSTER_MATCH_OUTCOME_KV_KEY } from 'src/logic-functions/constants/slack-roster-match-outcome-kv-key';
import { type SlackRosterMatchOutcome } from 'src/logic-functions/types/slack-roster-match-outcome.type';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const saveSlackRosterMatchOutcome = async (
  outcome: SlackRosterMatchOutcome,
): Promise<void> => {
  try {
    await kv.set(SLACK_ROSTER_MATCH_OUTCOME_KV_KEY, outcome);
  } catch (error) {
    console.warn(
      `[slack] failed to record the roster match outcome: ${toErrorMessage(error)}`,
    );
  }
};
