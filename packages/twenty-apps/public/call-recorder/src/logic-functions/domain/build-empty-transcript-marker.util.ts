import { isUndefined } from '@sniptt/guards';

import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';

export const buildEmptyTranscriptMarker = ({
  recallTranscriptId,
  subCode,
}: {
  recallTranscriptId: string | null;
  subCode?: string;
}): TranscriptMarker => ({
  recallTranscriptId,
  status: 'EMPTY',
  ...(isUndefined(subCode) ? {} : { subCode }),
});
