import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

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

  const personalNoteUpdatedAt = fields.granolaPersonalNoteUpdatedAt;

  const updateExistingRecordingOrThrow = async () => {
    if (isDefined(personalNoteUpdatedAt)) {
      // A null revision marks a recording owned by workspace sync.
      const result = await coreApiClient.mutation({
        updateCallRecordings: {
          __args: {
            filter: {
              id: { eq: callRecordingId },
              granolaPersonalNoteUpdatedAt: { lt: personalNoteUpdatedAt },
            },
            data: toCallRecordingMutationFields(fields),
          },
          id: true,
        },
      });

      return isNonEmptyArray(result.updateCallRecordings)
        ? { callRecordingId, created: false }
        : { callRecordingId, created: false, skipped: true };
    }

    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return { callRecordingId, created: false };
  };

  if (await doesCallRecordingExistOrThrow({ coreApiClient, callRecordingId })) {
    return updateExistingRecordingOrThrow();
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

    return updateExistingRecordingOrThrow();
  }
};
