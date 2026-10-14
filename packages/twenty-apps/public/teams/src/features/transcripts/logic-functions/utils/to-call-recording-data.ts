import { isDefined } from 'twenty-sdk/utils';

import { type CallRecordingSyncFields } from 'src/features/transcripts/logic-functions/types/call-recording-sync-fields.type';

export const toCallRecordingData = ({
  transcript,
  ...fields
}: CallRecordingSyncFields) =>
  isDefined(transcript)
    ? {
        ...fields,
        transcript: transcript as unknown as Record<string, unknown>,
      }
    : fields;
