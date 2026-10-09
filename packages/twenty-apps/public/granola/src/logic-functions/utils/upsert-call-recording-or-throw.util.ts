import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { findCallRecordingSyncStatesOrThrow } from 'src/logic-functions/utils/find-call-recording-sync-states-or-throw.util';
import { toCallRecordingMutationFields } from 'src/logic-functions/utils/to-call-recording-mutation-fields.util';
import { updateCallRecordingOrThrow } from 'src/logic-functions/utils/update-call-recording-or-throw.util';

export const upsertCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  syncState,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  syncState: CallRecordingSyncState | undefined;
  fields: CallRecordingSyncFields;
}): Promise<{
  callRecordingId: string;
  created: boolean;
  skipped?: boolean;
}> => {
  if (isDefined(syncState?.deletedAt)) {
    return { callRecordingId, created: false, skipped: true };
  }

  if (isDefined(syncState)) {
    const isUpdated = await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return isUpdated
      ? { callRecordingId, created: false }
      : { callRecordingId, created: false, skipped: true };
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
    const concurrentSyncState = (
      await findCallRecordingSyncStatesOrThrow({
        coreApiClient,
        callRecordingIds: [callRecordingId],
      })
    ).get(callRecordingId);

    if (!isDefined(concurrentSyncState)) {
      throw error;
    }

    if (isDefined(concurrentSyncState.deletedAt)) {
      return { callRecordingId, created: false, skipped: true };
    }

    const isUpdated = await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return isUpdated
      ? { callRecordingId, created: false }
      : { callRecordingId, created: false, skipped: true };
  }
};
