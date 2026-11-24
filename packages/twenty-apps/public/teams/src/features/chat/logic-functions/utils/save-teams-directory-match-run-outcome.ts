import { kv } from 'twenty-sdk/logic-function';

import { TEAMS_DIRECTORY_MATCH_RUN_OUTCOME_KV_KEY } from 'src/features/chat/logic-functions/constants/teams-directory-match-run-outcome-kv-key';
import { type TeamsDirectoryMatchRunOutcome } from 'src/features/chat/logic-functions/types/teams-directory-match-run-outcome.type';
import { toErrorMessage } from 'src/utils/to-error-message';

export const saveTeamsDirectoryMatchRunOutcome = async (
  outcome: TeamsDirectoryMatchRunOutcome,
): Promise<void> => {
  try {
    await kv.set(TEAMS_DIRECTORY_MATCH_RUN_OUTCOME_KV_KEY, outcome);
  } catch (error) {
    console.warn(
      `[teams] failed to record the directory match outcome: ${toErrorMessage(error)}`,
    );
  }
};
