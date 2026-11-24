import { kv } from 'twenty-sdk/logic-function';

import { getWhatsappConnectionKvKey } from 'src/logic-functions/utils/get-whatsapp-connection-kv-key.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export const saveWhatsappHistoryImportState = ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: WhatsappHistoryImportState;
}): Promise<void> =>
  kv.set(
    getWhatsappConnectionKvKey({ kind: 'history-import', connectedAccountId }),
    state,
  );
