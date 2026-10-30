import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';

// A new run id supersedes any page still queued from an earlier run
export const startLinkedinHistoryImport = async ({
  connectedAccountId,
  importRange,
}: {
  connectedAccountId: string;
  importRange: LinkedinImportRange;
}): Promise<LinkedinHistoryImportState> => {
  const state: LinkedinHistoryImportState = {
    runId: crypto.randomUUID(),
    importRange,
    status: 'IMPORTING',
    importedConversationCount: 0,
    startedAt: new Date().toISOString(),
  };

  await saveLinkedinHistoryImportState({ connectedAccountId, state });
  await enqueueLinkedinImportHistoryJob({
    connectedAccountId,
    runId: state.runId,
    pageIndex: 0,
  });

  return state;
};
