import { RestApiClient } from 'twenty-client-sdk/rest';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';

export const updateCallRecordingOrThrow = async ({
  callRecordingId,
  fields,
}: {
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<void> => {
  await new RestApiClient({ runAs: 'application' }).patch(
    `/rest/callRecordings/${callRecordingId}`,
    fields,
  );
};
