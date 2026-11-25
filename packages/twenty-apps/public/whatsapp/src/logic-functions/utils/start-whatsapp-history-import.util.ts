import { enqueueJobs } from 'twenty-sdk/logic-function';

import { WHATSAPP_HISTORY_CONVERSATION_LIMIT } from 'src/constants/whatsapp-history-conversation-limit.constant';
import { WHATSAPP_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getWhatsappPlanHistoryImportJobId } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';
import { saveWhatsappHistoryImportState } from 'src/logic-functions/utils/save-whatsapp-history-import-state.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

const WHATSAPP_PLAN_HISTORY_IMPORT_RETRY_LIMIT = 3;

export const startWhatsappHistoryImport = async ({
  connectedAccountId,
  settings,
  delayMs,
}: {
  connectedAccountId: string;
  settings: Pick<WhatsappSettings, 'importPolicy'>;
  delayMs?: number;
}): Promise<WhatsappHistoryImportState> => {
  const state: WhatsappHistoryImportState = {
    runId: crypto.randomUUID(),
    importPolicy: settings.importPolicy,
    conversationLimit: WHATSAPP_HISTORY_CONVERSATION_LIMIT,
    status: 'IMPORTING',
    importedConversationCount: 0,
    processedConversationCount: 0,
    startedAt: new Date().toISOString(),
  };

  await saveWhatsappHistoryImportState({ connectedAccountId, state });
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      WHATSAPP_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
    jobs: [
      {
        jobId: getWhatsappPlanHistoryImportJobId({ runId: state.runId }),
        payload: { connectedAccountId, runId: state.runId },
      },
    ],
    retryLimit: WHATSAPP_PLAN_HISTORY_IMPORT_RETRY_LIMIT,
    delayMs,
  });

  return state;
};
