import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { getWhatsappHistoryImportState } from 'src/logic-functions/utils/get-whatsapp-history-import-state.util';

export const getActiveWhatsappHistoryImportState = async ({
  connectedAccountId,
  runId,
}: {
  connectedAccountId: string;
  runId: string;
}): Promise<WhatsappHistoryImportState | null> => {
  const state = await getWhatsappHistoryImportState(connectedAccountId);

  return state?.runId === runId && state.status === 'IMPORTING' ? state : null;
};
