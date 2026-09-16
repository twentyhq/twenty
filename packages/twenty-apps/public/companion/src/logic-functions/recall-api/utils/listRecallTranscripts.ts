import { isArray, isUndefined } from '@sniptt/guards';
import { type RecallBotOperationFailure } from 'src/logic-functions/types/RecallBotOperationFailure';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { getString } from 'src/logic-functions/utils/getString';
import { fetchRecallListPages } from 'src/logic-functions/recall-api/utils/fetchRecallListPages';
import { type RecallListResponse } from 'src/logic-functions/types/RecallListResponse';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/utils/getRecallApiConfig';
import { type RecallTranscriptSummary } from 'src/logic-functions/types/RecallTranscriptSummary';

type ListRecallTranscriptsResult =
  | { ok: true; transcripts: RecallTranscriptSummary[] }
  | RecallBotOperationFailure;

const RECALL_TRANSCRIPT_LIST_MAX_PAGES = 10;

export const listRecallTranscripts = async ({
  externalRecordingId,
}: {
  externalRecordingId: string;
}): Promise<ListRecallTranscriptsResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const searchParams = new URLSearchParams({
    recording_id: externalRecordingId,
  });
  const result = await fetchRecallListPages({
    config: configResult.config,
    initialPath: `/transcript/?${searchParams.toString()}`,
    maxPages: RECALL_TRANSCRIPT_LIST_MAX_PAGES,
    shouldStartPageRequest: () => true,
    extractPageItems: extractRecallTranscriptSummaries,
    malformedErrorMessage: 'Recall API returned malformed transcript list',
  });

  if (!result.ok) {
    return result;
  }

  if (result.truncated) {
    return {
      ok: false,
      status: null,
      errorMessage: `Recall transcript list exceeded ${RECALL_TRANSCRIPT_LIST_MAX_PAGES} pages`,
    };
  }

  return { ok: true, transcripts: result.items };
};

const extractRecallTranscriptSummaries = (
  response: RecallListResponse | undefined,
): RecallTranscriptSummary[] | undefined => {
  if (!isArray(response?.results)) {
    return undefined;
  }

  const transcripts: RecallTranscriptSummary[] = [];

  for (const result of response.results) {
    const transcript = extractRecallTranscriptSummary(result);

    if (isUndefined(transcript)) {
      return undefined;
    }

    transcripts.push(transcript);
  }

  return transcripts;
};

const extractRecallTranscriptSummary = (
  transcript: unknown,
): RecallTranscriptSummary | undefined => {
  const transcriptRecord = asRecord(transcript);
  const transcriptId = getString(transcriptRecord?.id);

  if (isUndefined(transcriptRecord) || isUndefined(transcriptId)) {
    return undefined;
  }

  const status = asRecord(transcriptRecord.status);

  return {
    id: transcriptId,
    statusCode: getString(status?.code),
    statusSubCode: getString(status?.sub_code),
  };
};
