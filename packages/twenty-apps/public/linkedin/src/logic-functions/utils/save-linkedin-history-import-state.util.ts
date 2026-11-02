import { kv } from 'twenty-sdk/logic-function';

import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const saveLinkedinHistoryImportState = ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<void> =>
  kv.set(
    getLinkedinConnectionKvKey({ kind: 'history-import', connectedAccountId }),
    state,
  );
