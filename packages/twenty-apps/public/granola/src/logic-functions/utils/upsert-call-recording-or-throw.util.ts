import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { doesCallRecordingExistOrThrow } from 'src/logic-functions/utils/does-call-recording-exist-or-throw.util';
import { isCallRecordingSoftDeletedOrThrow } from 'src/logic-functions/utils/is-call-recording-soft-deleted-or-throw.util';
import { updateCallRecordingOrThrow } from 'src/logic-functions/utils/update-call-recording-or-throw.util';

// The generated core client types the transcript JSON scalar as an object, so
// the array-valued fields go through the REST API instead of a typed mutation.
export const upsertCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<{
  callRecordingId: string;
  created: boolean;
  skipped?: boolean;
}> => {
  if (
    await isCallRecordingSoftDeletedOrThrow({ coreApiClient, callRecordingId })
  ) {
    return { callRecordingId, created: false, skipped: true };
  }

  if (await doesCallRecordingExistOrThrow({ coreApiClient, callRecordingId })) {
    await updateCallRecordingOrThrow({ callRecordingId, fields });

    return { callRecordingId, created: false };
  }

  try {
    await new RestApiClient({ runAs: 'application' }).post(
      '/rest/callRecordings',
      { id: callRecordingId, ...fields },
    );

    return { callRecordingId, created: true };
  } catch (error) {
    if (
      !(await doesCallRecordingExistOrThrow({ coreApiClient, callRecordingId }))
    ) {
      throw error;
    }

    await updateCallRecordingOrThrow({ callRecordingId, fields });

    return { callRecordingId, created: false };
  }
};
