import { kv } from 'twenty-sdk/logic-function';

import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const getLinkedinHistoryImportState = (
  connectedAccountId: string,
): Promise<LinkedinHistoryImportState | null> =>
  kv.get<LinkedinHistoryImportState>(
    getLinkedinConnectionKvKey({ kind: 'history-import', connectedAccountId }),
  );
