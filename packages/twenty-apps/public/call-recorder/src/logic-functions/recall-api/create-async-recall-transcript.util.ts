import { isString } from '@sniptt/guards';

import { RECALL_ASYNC_TRANSCRIPT_PROVIDER } from 'src/logic-functions/constants/recall-async-transcript-provider';
import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

type CreateAsyncRecallTranscriptResult =
  | { ok: true; transcriptId: string }
  | RecallBotOperationFailure;

export const createAsyncRecallTranscript = async ({
  externalRecordingId,
}: {
  externalRecordingId: string;
}): Promise<CreateAsyncRecallTranscriptResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<{ id?: unknown }>({
    config: configResult.config,
    path: `/recording/${externalRecordingId}/create_transcript/`,
    method: 'POST',
    body: {
      provider: RECALL_ASYNC_TRANSCRIPT_PROVIDER,
      diarization: { use_separate_streams_when_available: true },
    },
    maxAttempts: 1,
  });

  if (!result.ok) {
    return result;
  }

  if (!isString(result.data?.id)) {
    return {
      ok: false,
      status: null,
      errorMessage:
        'Recall API created a transcript but the response did not include a transcript id',
    };
  }

  return { ok: true, transcriptId: result.data.id };
};
