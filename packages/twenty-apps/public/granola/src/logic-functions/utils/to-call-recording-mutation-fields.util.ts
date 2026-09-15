import { isDefined } from 'twenty-sdk/utils';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';

export const toCallRecordingMutationFields = ({
  transcript,
  ...fields
}: CallRecordingSyncFields) => {
  if (!isDefined(transcript)) {
    return fields;
  }

  return {
    ...fields,
    // The SDK's JSON scalar rejects arrays; remove this cast when its typing is fixed.
    transcript: transcript as unknown as Record<string, unknown>,
  };
};
