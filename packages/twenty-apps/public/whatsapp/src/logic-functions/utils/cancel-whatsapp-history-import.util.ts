import { getWhatsappHistoryImportState } from 'src/logic-functions/utils/get-whatsapp-history-import-state.util';
import { finishWhatsappHistoryImport } from 'src/logic-functions/utils/refresh-whatsapp-history-import-state.util';

export const cancelWhatsappHistoryImport = async (
  connectedAccountId: string,
): Promise<void> => {
  const state = await getWhatsappHistoryImportState(connectedAccountId);

  if (state?.status !== 'IMPORTING') {
    return;
  }

  await finishWhatsappHistoryImport({
    connectedAccountId,
    state: {
      ...state,
      status: 'CANCELLED',
      finishedAt: new Date().toISOString(),
    },
  });
};
