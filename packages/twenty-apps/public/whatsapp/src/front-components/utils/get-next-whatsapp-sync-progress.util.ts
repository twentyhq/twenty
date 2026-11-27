import { isDefined } from 'twenty-sdk/utils';

import { getWhatsappSyncProgress } from 'src/front-components/utils/get-whatsapp-sync-progress.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

type WhatsappSyncProgress = { runId: string; progress: number };

export const getNextWhatsappSyncProgress = ({
  current,
  historyImport,
}: {
  current: WhatsappSyncProgress | null;
  historyImport: WhatsappHistoryImportState | null;
}): WhatsappSyncProgress | null => {
  if (historyImport?.status !== 'IMPORTING') {
    return null;
  }

  const progress = getWhatsappSyncProgress(historyImport);

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
