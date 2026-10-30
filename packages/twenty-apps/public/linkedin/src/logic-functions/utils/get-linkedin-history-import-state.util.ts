import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const getLinkedinHistoryImportState = async (
  connectedAccountId: string,
): Promise<LinkedinHistoryImportState | null> => {
  const state = await kv.get<LinkedinHistoryImportState>(
    getLinkedinConnectionKvKey({ kind: 'history-import', connectedAccountId }),
  );

  // Runs stored before progress was tracked carry no processed count
  return isDefined(state)
    ? {
        ...state,
        processedConversationCount: state.processedConversationCount ?? 0,
      }
    : null;
};
