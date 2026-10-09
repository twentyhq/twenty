import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { createRecordsWithPerRecordFallback } from 'src/logic-functions/utils/create-records-with-per-record-fallback.util';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

export const createCallRecordings = async ({
  coreApiClient,
  callRecordings,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordings: Array<{ id: string; fields: CallRecordingSyncFields }>;
}): Promise<Set<string>> => {
  const createdCallRecordings = await createRecordsWithPerRecordFallback({
    records: callRecordings,
    createRecords: (records) =>
      coreApiClient.mutation({
        createCallRecordings: {
          __args: {
            data: records.map(({ id, fields }) => ({ id, ...fields })),
          },
          id: true,
        },
      }),
    createRecord: async ({ id, fields }) => {
      const { created } = await upsertCallRecording({
        coreApiClient,
        callRecordingId: id,
        createFields: fields,
        updateFields: fields,
        expectedUpdatedAt: undefined,
      });

      return created;
    },
  });

  return new Set(createdCallRecordings.map(({ id }) => id));
};
