import { enqueueJobs } from 'twenty-sdk/logic-function';

import { LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getLinkedinPlanHistoryImportJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

const LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT = 3;

export const startLinkedinHistoryImport = async ({
  connectedAccountId,
  importPolicy,
}: {
  connectedAccountId: string;
  importPolicy: LinkedinImportPolicy;
}): Promise<LinkedinHistoryImportState> => {
  const state: LinkedinHistoryImportState = {
    runId: crypto.randomUUID(),
    importPolicy,
    status: 'IMPORTING',
    importedConversationCount: 0,
    processedConversationCount: 0,
    startedAt: new Date().toISOString(),
  };

  await saveLinkedinHistoryImportState({ connectedAccountId, state });
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        jobId: getLinkedinPlanHistoryImportJobId({ runId: state.runId }),
        payload: { connectedAccountId, runId: state.runId },
      },
    ],
    retryLimit: LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT,
  });

  return state;
};
