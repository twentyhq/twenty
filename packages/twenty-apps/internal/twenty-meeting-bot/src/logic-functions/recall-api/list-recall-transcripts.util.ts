import { isArray, isUndefined } from '@sniptt/guards';

import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

export type RecallTranscriptSummary = {
  id: string;
  createdAt: string | undefined;
  downloadUrl: string | undefined;
  provider: string | undefined;
  statusCode: string | undefined;
  statusSubCode: string | undefined;
};

type ListRecallTranscriptsResult =
  | { ok: true; transcripts: RecallTranscriptSummary[] }
  | RecallBotOperationFailure;

type RecallTranscriptListResponse = {
  next?: unknown;
  results?: unknown;
};

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

  const transcripts: RecallTranscriptSummary[] = [];
  let path: string | undefined = buildListRecallTranscriptsPath({
    externalRecordingId,
  });

  for (
    let pageIndex = 0;
    !isUndefined(path) && pageIndex < RECALL_TRANSCRIPT_LIST_MAX_PAGES;
    pageIndex++
  ) {
    const result = await recallBotApiRequest<RecallTranscriptListResponse>({
      config: configResult.config,
      path,
      method: 'GET',
    });

    if (!result.ok) {
      return result;
    }

    const pageTranscripts = extractRecallTranscriptSummaries(result.data);

    if (isUndefined(pageTranscripts)) {
      return {
        ok: false,
        status: result.status,
        errorMessage: 'Recall API returned malformed transcript list',
      };
    }

    transcripts.push(...pageTranscripts);
    path = extractNextPath(result.data, configResult.config.baseUrl);
  }

  if (!isUndefined(path)) {
    return {
      ok: false,
      status: null,
      errorMessage: `Recall transcript list exceeded ${RECALL_TRANSCRIPT_LIST_MAX_PAGES} pages`,
    };
  }

  return { ok: true, transcripts };
};

const buildListRecallTranscriptsPath = ({
  externalRecordingId,
}: {
  externalRecordingId: string;
}): string => {
  const searchParams = new URLSearchParams({
    recording_id: externalRecordingId,
  });

  return `/transcript/?${searchParams.toString()}`;
};

const extractRecallTranscriptSummaries = (
  response: RecallTranscriptListResponse | undefined,
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

  const data = asRecord(transcriptRecord.data);
  const status = asRecord(transcriptRecord.status);

  return {
    id: transcriptId,
    createdAt: getString(transcriptRecord.created_at),
    downloadUrl: getString(data?.download_url),
    provider: extractTranscriptProvider(transcriptRecord.provider),
    statusCode: getString(status?.code),
    statusSubCode: getString(status?.sub_code),
  };
};

const extractTranscriptProvider = (provider: unknown): string | undefined => {
  const providerRecord = asRecord(provider);

  if (isUndefined(providerRecord)) {
    return undefined;
  }

  return Object.entries(providerRecord).find(
    ([, providerConfiguration]) =>
      !isUndefined(providerConfiguration) && providerConfiguration !== null,
  )?.[0];
};

const extractNextPath = (
  response: RecallTranscriptListResponse | undefined,
  baseUrl: string,
): string | undefined => {
  const nextPage = getString(response?.next);

  if (isUndefined(nextPage) || !nextPage.startsWith(baseUrl)) {
    return undefined;
  }

  return nextPage.slice(baseUrl.length);
};
