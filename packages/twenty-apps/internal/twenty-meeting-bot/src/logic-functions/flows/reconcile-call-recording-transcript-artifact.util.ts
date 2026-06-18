import { isNull, isUndefined } from '@sniptt/guards';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingUpdateFields } from 'src/logic-functions/data/update-call-recording.util';
import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { createAsyncRecallTranscript } from 'src/logic-functions/recall-api/create-async-recall-transcript.util';
import {
  listRecallTranscripts,
  type RecallTranscriptSummary,
} from 'src/logic-functions/recall-api/list-recall-transcripts.util';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';

type CallRecordingTranscriptArtifactUpdateFields = Pick<
  CallRecordingUpdateFields,
  'status' | 'transcript'
>;

export type ReconcileCallRecordingTranscriptArtifactResult = {
  updateData: CallRecordingTranscriptArtifactUpdateFields;
  requestedTranscript: boolean;
};

export const reconcileCallRecordingTranscriptArtifact = async ({
  callRecordingId,
  currentStatus,
  externalRecordingId,
  transcript,
}: {
  callRecordingId: string;
  currentStatus: string | undefined;
  externalRecordingId: string;
  transcript: unknown;
}): Promise<ReconcileCallRecordingTranscriptArtifactResult> => {
  const existingTranscriptMarker = parseTranscriptMarker(transcript);

  if (
    !isNull(transcript) &&
    !isUndefined(transcript) &&
    isUndefined(existingTranscriptMarker)
  ) {
    return buildEmptyTranscriptArtifactResult();
  }

  if (existingTranscriptMarker?.status === 'FAILED') {
    return buildEmptyTranscriptArtifactResult();
  }

  const listResult = await listRecallTranscripts({ externalRecordingId });

  if (!listResult.ok) {
    console.warn(
      `[twenty-meeting-bot] failed to list Recall transcripts for recording ${externalRecordingId}: ${listResult.errorMessage}`,
    );

    return buildEmptyTranscriptArtifactResult();
  }

  const transcriptArtifact = selectRecallTranscriptArtifact(
    listResult.transcripts,
  );

  if (isUndefined(transcriptArtifact)) {
    const createResult = await createAsyncRecallTranscript({
      externalRecordingId,
      callRecordingId,
    });

    if (!createResult.ok) {
      console.warn(
        `[twenty-meeting-bot] failed to request transcript for Recall recording ${externalRecordingId}: ${createResult.errorMessage}`,
      );

      return buildEmptyTranscriptArtifactResult();
    }

    return { updateData: {}, requestedTranscript: true };
  }

  if (
    transcriptArtifact.statusCode === 'failed' ||
    transcriptArtifact.statusCode === 'error'
  ) {
    return {
      updateData: buildTranscriptFailureUpdate({
        currentStatus,
        transcriptId: transcriptArtifact.id,
        subCode: transcriptArtifact.statusSubCode ?? null,
      }),
      requestedTranscript: false,
    };
  }

  if (transcriptArtifact.statusCode !== 'done') {
    return buildEmptyTranscriptArtifactResult();
  }

  const downloadResult = await downloadTranscript({
    transcriptId: transcriptArtifact.id,
  });

  if (downloadResult.outcome === 'filled') {
    return {
      updateData: {
        transcript: downloadResult.content as Record<string, unknown>,
      },
      requestedTranscript: false,
    };
  }

  if (downloadResult.outcome === 'failed') {
    return {
      updateData: buildTranscriptFailureUpdate({
        currentStatus,
        transcriptId: transcriptArtifact.id,
        subCode: downloadResult.subCode,
      }),
      requestedTranscript: false,
    };
  }

  if (downloadResult.outcome === 'error') {
    console.warn(
      `[twenty-meeting-bot] could not fill transcript for call recording ${callRecordingId}: ${downloadResult.errorMessage}`,
    );
  }

  return buildEmptyTranscriptArtifactResult();
};

const buildEmptyTranscriptArtifactResult =
  (): ReconcileCallRecordingTranscriptArtifactResult => ({
    updateData: {},
    requestedTranscript: false,
  });

const selectRecallTranscriptArtifact = (
  transcripts: RecallTranscriptSummary[],
): RecallTranscriptSummary | undefined =>
  transcripts
    .filter((transcript) => transcript.statusCode !== 'deleted')
    .sort(compareRecallTranscriptArtifacts)[0];

const compareRecallTranscriptArtifacts = (
  firstTranscript: RecallTranscriptSummary,
  secondTranscript: RecallTranscriptSummary,
): number => {
  const firstProviderPriority = getTranscriptProviderPriority(firstTranscript);
  const secondProviderPriority = getTranscriptProviderPriority(secondTranscript);

  if (firstProviderPriority !== secondProviderPriority) {
    return firstProviderPriority - secondProviderPriority;
  }

  const firstStatusPriority = getTranscriptStatusPriority(firstTranscript);
  const secondStatusPriority = getTranscriptStatusPriority(secondTranscript);

  if (firstStatusPriority !== secondStatusPriority) {
    return firstStatusPriority - secondStatusPriority;
  }

  return (
    getTranscriptCreatedAtTime(secondTranscript) -
    getTranscriptCreatedAtTime(firstTranscript)
  );
};

const getTranscriptProviderPriority = ({
  provider,
}: RecallTranscriptSummary): number => (provider === 'recallai_async' ? 0 : 1);

const getTranscriptStatusPriority = ({
  statusCode,
}: RecallTranscriptSummary): number => {
  switch (statusCode) {
    case 'done':
      return 0;
    case 'processing':
      return 1;
    case 'failed':
    case 'error':
      return 2;
    default:
      return 3;
  }
};

const getTranscriptCreatedAtTime = ({
  createdAt,
}: RecallTranscriptSummary): number => {
  if (isUndefined(createdAt)) {
    return 0;
  }

  const createdAtTime = new Date(createdAt).getTime();

  return Number.isNaN(createdAtTime) ? 0 : createdAtTime;
};

const buildTranscriptFailureUpdate = ({
  currentStatus,
  transcriptId,
  subCode,
}: {
  currentStatus: string | undefined;
  transcriptId: string;
  subCode: string | null;
}): CallRecordingTranscriptArtifactUpdateFields => ({
  transcript: buildFailedTranscriptMarker({
    recallTranscriptId: transcriptId,
    subCode,
  }),
  ...(isCallRecordingStatusDowngrade({
    fromStatus: currentStatus,
    toStatus: CallRecordingStatus.FAILED_UNKNOWN,
  })
    ? {}
    : { status: CallRecordingStatus.FAILED_UNKNOWN }),
});
