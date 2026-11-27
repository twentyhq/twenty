import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';
import { type LinkedinHistoryImportChatJobResult } from 'src/logic-functions/types/linkedin-history-import-chat-job-result.type';
import { failLinkedinHistoryImportJob } from 'src/logic-functions/utils/fail-linkedin-history-import-job.util';
import { finishLinkedinHistoryImportChat } from 'src/logic-functions/utils/finish-linkedin-history-import-chat.util';
import { scheduleLinkedinHistoryImportChatJob } from 'src/logic-functions/utils/schedule-linkedin-history-import-chat-job.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

export const handleLinkedinHistoryImportChatJobError = async ({
  job,
  error,
  context,
}: {
  job: LinkedinHistoryImportChatJob;
  error: unknown;
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>;
}): Promise<LinkedinHistoryImportChatJobResult> => {
  const { connectedAccountId, runId, chat } = job.payload;

  if (error instanceof UnipileRateLimitError) {
    console.log(
      `[linkedin] history run ${runId}: conversation ${chat.id} paused for ${error.retryAfterSeconds}s: ${error.message}`,
    );

    const attempt = (job.payload.attempt ?? 0) + 1;
    const isScheduled = await scheduleLinkedinHistoryImportChatJob({
      job:
        job.kind === 'CONTACTS'
          ? { kind: 'CONTACTS', payload: { ...job.payload, attempt } }
          : { kind: 'MESSAGES', payload: { ...job.payload, attempt } },
      delayMs: error.retryAfterSeconds * 1000,
    });

    return { status: isScheduled ? 'PAUSED' : 'CANCELLED' };
  }

  return failLinkedinHistoryImportJob({
    error,
    context,
    onFinalFailure: async (importError) => {
      await finishLinkedinHistoryImportChat({
        connectedAccountId,
        runId,
        chatId: chat.id,
        status: 'FAILED',
        error: importError,
      });
    },
  });
};
