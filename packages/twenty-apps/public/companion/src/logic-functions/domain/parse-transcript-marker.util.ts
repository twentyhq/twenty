import { isString, isUndefined } from '@sniptt/guards';

import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export const parseTranscriptMarker = (
  transcript: unknown,
): TranscriptMarker | undefined => {
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
