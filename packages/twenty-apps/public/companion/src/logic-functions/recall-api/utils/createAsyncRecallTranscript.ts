import { isString } from '@sniptt/guards';
import { type RecallBotOperationFailure } from 'src/logic-functions/types/RecallBotOperationFailure';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/utils/getRecallApiConfig';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/utils/recallBotApiRequest';
import { getRecallAsyncTranscriptProvider } from 'src/logic-functions/utils/getRecallAsyncTranscriptProvider';

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
      provider: getRecallAsyncTranscriptProvider(),
      diarization: { use_separate_streams_when_available: true },
    },
    maxAttempts: 1,
  });

  if (!result.ok) {
    return result;
  }

  if (!isString(result.data?.id) || !result.data.id.trim()) {
    return {
      ok: false,
      status: null,
      errorMessage:
        'Recall API created a transcript but the response did not include a transcript id',
    };
  }

  return { ok: true, transcriptId: result.data.id };
};
