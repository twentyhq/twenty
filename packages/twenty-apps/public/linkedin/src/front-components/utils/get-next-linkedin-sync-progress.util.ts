import { isDefined } from 'twenty-sdk/utils';

import { getLinkedinSyncProgress } from 'src/front-components/utils/get-linkedin-sync-progress.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

type LinkedinSyncProgress = { runId: string; progress: number };

export const getNextLinkedinSyncProgress = ({
  current,
  historyImport,
}: {
  current: LinkedinSyncProgress | null;
  historyImport: LinkedinHistoryImportState | null;
}): LinkedinSyncProgress | null => {
  if (historyImport?.status !== 'IMPORTING') {
    return null;
  }

  const progress = getLinkedinSyncProgress(historyImport);

  if (!isDefined(progress)) {
    return current?.runId === historyImport.runId ? current : null;
  }

  return {
    runId: historyImport.runId,
    progress:
      current?.runId === historyImport.runId
        ? Math.max(current.progress, progress)
        : progress,
  };
};
