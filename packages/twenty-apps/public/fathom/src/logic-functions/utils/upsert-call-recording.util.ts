import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { isDefined } from 'src/utils/is-defined';

const toCallRecordingInput = (fields: CallRecordingSyncFields) => ({
  ...fields,
  // The client types JSON as an object, but transcript is a valid JSON array.
  transcript: fields.transcript as unknown as
    | Record<string, unknown>
    | undefined,
});

export const upsertCallRecording = async ({
  coreApiClient,
  callRecordingId,
  createFields,
  updateFields,
  expectedUpdatedAt,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  createFields: CallRecordingSyncFields;
  updateFields: CallRecordingSyncFields;
  expectedUpdatedAt: string | undefined;
}): Promise<{ callRecordingId: string; created: boolean }> => {
  if (!isDefined(expectedUpdatedAt)) {
    try {
      await coreApiClient.mutation({
        createCallRecording: {
          __args: {
            data: {
              id: callRecordingId,
              ...toCallRecordingInput(createFields),
            },
          },
          id: true,
        },
      });
    } catch (error) {
      const result = await coreApiClient.query({
        callRecordings: {
          __args: { filter: { id: { eq: callRecordingId } }, first: 1 },
          edges: { node: { id: true } },
        },
      });

      if (!isDefined(result.callRecordings?.edges[0]?.node)) {
        throw error;
      }

      return { callRecordingId, created: false };
    }

    return { callRecordingId, created: true };
  }

  const result = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          updatedAt: { eq: expectedUpdatedAt },
        },
        data: toCallRecordingInput(updateFields),
      },
      id: true,
    },
  });

  if (!isNonEmptyArray(result.updateCallRecordings)) {
    throw new Error('Fathom recording changed during import; retry the import');
  }

  return { callRecordingId, created: false };
};
