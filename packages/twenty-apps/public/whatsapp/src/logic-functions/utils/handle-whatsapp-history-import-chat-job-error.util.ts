import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { type WhatsappHistoryImportChatJob } from 'src/logic-functions/types/whatsapp-history-import-chat-job.type';
import { type WhatsappHistoryImportChatJobResult } from 'src/logic-functions/types/whatsapp-history-import-chat-job-result.type';
import { failWhatsappHistoryImportJob } from 'src/logic-functions/utils/fail-whatsapp-history-import-job.util';
import { finishWhatsappHistoryImportChat } from 'src/logic-functions/utils/finish-whatsapp-history-import-chat.util';
import { scheduleWhatsappHistoryImportChatJob } from 'src/logic-functions/utils/schedule-whatsapp-history-import-chat-job.util';
import { scheduleNextWhatsappHistoryImportContacts } from 'src/logic-functions/utils/schedule-next-whatsapp-history-import-contacts.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

export const handleWhatsappHistoryImportChatJobError = async ({
  job,
  error,
  context,
}: {
  job: WhatsappHistoryImportChatJob;
  error: unknown;
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>;
}): Promise<WhatsappHistoryImportChatJobResult> => {
  const { connectedAccountId, runId, chat } = job.payload;

  if (error instanceof UnipileRateLimitError) {
    console.log(
      `[whatsapp] history run ${runId}: conversation ${chat.id} paused for ${error.retryAfterSeconds}s: ${error.message}`,
    );

    const attempt = (job.payload.attempt ?? 0) + 1;
    const isScheduled = await scheduleWhatsappHistoryImportChatJob({
      job:
        job.kind === 'CONTACTS'
          ? { kind: 'CONTACTS', payload: { ...job.payload, attempt } }
          : { kind: 'MESSAGES', payload: { ...job.payload, attempt } },
      delayMs: error.retryAfterSeconds * 1000,
    });

    return { status: isScheduled ? 'PAUSED' : 'CANCELLED' };
  }

  return failWhatsappHistoryImportJob({
    error,
    context,
    onFinalFailure: async (importError) => {
      if (job.kind === 'CONTACTS') {
        await scheduleNextWhatsappHistoryImportContacts({
          connectedAccountId,
          runId,
          afterChatId: chat.id,
        });
      }

      await finishWhatsappHistoryImportChat({
        connectedAccountId,
        runId,
        chatId: chat.id,
        status: 'FAILED',
        error: importError,
      });
    },
  });
};
