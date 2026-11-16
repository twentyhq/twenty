import { isBoolean } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { TEAMS_DIRECTORY_MATCH_RUN_OUTCOME_KV_KEY } from 'src/features/chat/logic-functions/constants/teams-directory-match-run-outcome-kv-key';
import { type TeamsDirectoryMatchRunOutcome } from 'src/features/chat/logic-functions/types/teams-directory-match-run-outcome.type';

export const readTeamsDirectoryMatchRunOutcome = async (): Promise<
  TeamsDirectoryMatchRunOutcome | undefined
> => {
  try {
    const record = await kv.get<Partial<TeamsDirectoryMatchRunOutcome>>(
      TEAMS_DIRECTORY_MATCH_RUN_OUTCOME_KV_KEY,
    );

    return isBoolean(record?.isSuccessful)
      ? { isSuccessful: record.isSuccessful, errorMessage: record.errorMessage }
      : undefined;
  } catch {
    return undefined;
  }
};
