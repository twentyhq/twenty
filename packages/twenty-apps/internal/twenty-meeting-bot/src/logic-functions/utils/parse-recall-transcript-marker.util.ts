import { isString, isUndefined } from '@sniptt/guards';

import { type RecallTranscriptMarker } from 'src/logic-functions/types/recall-transcript-marker.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

// Real transcript content never carries a marker status, so undefined means "actual transcript or empty".
export const parseRecallTranscriptMarker = (
  transcript: unknown,
): RecallTranscriptMarker | undefined => {
  const candidate = asRecord(transcript);

  if (isUndefined(candidate)) {
    return undefined;
  }

  if (candidate.status !== 'PENDING' && candidate.status !== 'FAILED') {
    return undefined;
  }

  return {
    recallTranscriptId: isString(candidate.recallTranscriptId)
      ? candidate.recallTranscriptId
      : null,
    status: candidate.status,
    ...(isString(candidate.requestedAt)
      ? { requestedAt: candidate.requestedAt }
      : {}),
    ...(isString(candidate.subCode) ? { subCode: candidate.subCode } : {}),
  };
};
