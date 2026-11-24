import { kv } from 'twenty-sdk/logic-function';

import { getWhatsappConnectionKvKey } from 'src/logic-functions/utils/get-whatsapp-connection-kv-key.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export const getWhatsappHistoryImportState = (
  connectedAccountId: string,
): Promise<WhatsappHistoryImportState | null> =>
  kv.get<WhatsappHistoryImportState>(
    getWhatsappConnectionKvKey({ kind: 'history-import', connectedAccountId }),
  );
