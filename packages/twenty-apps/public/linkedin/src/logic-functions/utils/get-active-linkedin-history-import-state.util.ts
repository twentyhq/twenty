import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';

export const getActiveLinkedinHistoryImportState = async ({
  connectedAccountId,
  runId,
}: {
  connectedAccountId: string;
  runId: string;
}): Promise<LinkedinHistoryImportState | null> => {
  const state = await getLinkedinHistoryImportState(connectedAccountId);

  return state?.runId === runId && state.status === 'IMPORTING' ? state : null;
};
