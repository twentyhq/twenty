import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { toCallRecordingMutationFields } from 'src/logic-functions/utils/to-call-recording-mutation-fields.util';

export const updateCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<boolean> => {
  const result: { updateCallRecordings?: { id: string }[] } =
    await coreApiClient.mutation({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: callRecordingId },
            deletedAt: { is: 'NULL' },
          },
          data: toCallRecordingMutationFields(fields),
        },
        id: true,
      },
    });

  return isNonEmptyArray(result.updateCallRecordings);
};
