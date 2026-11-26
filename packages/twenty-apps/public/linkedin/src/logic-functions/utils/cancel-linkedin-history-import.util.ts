import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { finishLinkedinHistoryImport } from 'src/logic-functions/utils/refresh-linkedin-history-import-state.util';

export const cancelLinkedinHistoryImport = async (
  connectedAccountId: string,
): Promise<void> => {
  const state = await getLinkedinHistoryImportState(connectedAccountId);

  if (state?.status !== 'IMPORTING') {
    return;
  }

  await finishLinkedinHistoryImport({
    connectedAccountId,
    state: {
      ...state,
      status: 'CANCELLED',
      finishedAt: new Date().toISOString(),
    },
  });
};
