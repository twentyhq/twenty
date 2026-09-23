import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { doesCallRecordingExistOrThrow } from 'src/logic-functions/utils/does-call-recording-exist-or-throw.util';
import { isCallRecordingSoftDeletedOrThrow } from 'src/logic-functions/utils/is-call-recording-soft-deleted-or-throw.util';
import { toCallRecordingMutationFields } from 'src/logic-functions/utils/to-call-recording-mutation-fields.util';
import { updateCallRecordingOrThrow } from 'src/logic-functions/utils/update-call-recording-or-throw.util';

export const upsertCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
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
    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return { callRecordingId, created: false };
  }

  try {
    await coreApiClient.mutation({
      createCallRecording: {
        __args: {
          data: {
            id: callRecordingId,
            ...toCallRecordingMutationFields(fields),
          },
        },
        id: true,
      },
    });

    return { callRecordingId, created: true };
  } catch (error) {
    if (
      !(await doesCallRecordingExistOrThrow({ coreApiClient, callRecordingId }))
    ) {
      throw error;
    }

    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return { callRecordingId, created: false };
  }
};
