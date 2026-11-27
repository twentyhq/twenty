import { enqueueJobs } from 'twenty-sdk/logic-function';

import { WHATSAPP_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappImportHistoryJobPayload } from 'src/logic-functions/types/whatsapp-import-history-job-payload.type';
import { getWhatsappImportHistoryJobId } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';

const WHATSAPP_IMPORT_HISTORY_RETRY_LIMIT = 3;

export const enqueueWhatsappImportHistoryJob = async (
  payload: WhatsappImportHistoryJobPayload,
  delayMs?: number,
): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      WHATSAPP_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
    jobs: [{ jobId: getWhatsappImportHistoryJobId(payload), payload }],
    retryLimit: WHATSAPP_IMPORT_HISTORY_RETRY_LIMIT,
    delayMs,
  });
};
