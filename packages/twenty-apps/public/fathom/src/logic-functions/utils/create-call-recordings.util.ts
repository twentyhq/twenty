import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

export const createCallRecordings = async ({
  coreApiClient,
  callRecordings,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordings: Array<{ id: string; fields: CallRecordingSyncFields }>;
}): Promise<Set<string>> => {
  if (callRecordings.length > 1) {
    try {
      await coreApiClient.mutation({
        createCallRecordings: {
          __args: {
            data: callRecordings.map(({ id, fields }) => ({ id, ...fields })),
          },
          id: true,
        },
      });

      return new Set(callRecordings.map(({ id }) => id));
    } catch (error) {
      if (error instanceof RetryableLogicFunctionError) {
        throw error;
      }
    }
  }

  const createdCallRecordingIds = new Set<string>();

  for (const { id, fields } of callRecordings) {
    const { created } = await upsertCallRecording({
      coreApiClient,
      callRecordingId: id,
      createFields: fields,
      updateFields: fields,
      expectedUpdatedAt: undefined,
    });

    if (created) {
      createdCallRecordingIds.add(id);
    }
  }

  return createdCallRecordingIds;
};
