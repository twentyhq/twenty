import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

// A new run id supersedes any page still queued from an earlier run
export const startLinkedinHistoryImport = async ({
  connectedAccountId,
  importPolicy,
}: {
  connectedAccountId: string;
  importPolicy: LinkedinImportPolicy;
}): Promise<LinkedinHistoryImportState> => {
  const now = new Date().toISOString();
  const state: LinkedinHistoryImportState = {
    runId: crypto.randomUUID(),
    importPolicy,
    status: 'IMPORTING',
    importedConversationCount: 0,
    processedConversationCount: 0,
    startedAt: now,
    updatedAt: now,
  };

  await saveLinkedinHistoryImportState({ connectedAccountId, state });
  await enqueueLinkedinImportHistoryJob({
    connectedAccountId,
    runId: state.runId,
    pageIndex: 0,
  });

  return state;
};
