import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomRecordingImportFields } from 'src/logic-functions/types/fathom-recording-import-fields.type';
import { createRecordsWithPerRecordFallback } from 'src/logic-functions/utils/create-records-with-per-record-fallback.util';
import { upsertFathomRecordingImport } from 'src/logic-functions/utils/upsert-fathom-recording-import.util';

export const createFathomRecordingImports = async ({
  coreApiClient,
  fathomRecordingImports,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  fathomRecordingImports: Array<{
    id: string;
    fields: FathomRecordingImportFields & { recordingId: string };
  }>;
}): Promise<void> => {
  await createRecordsWithPerRecordFallback({
    records: fathomRecordingImports,
    createRecords: (records) =>
      coreApiClient.mutation({
        createFathomRecordingImports: {
          __args: {
            data: records.map(({ id, fields }) => ({ id, ...fields })),
          },
          id: true,
        },
      }),
    createRecord: async ({ id, fields }) => {
      await upsertFathomRecordingImport({
        coreApiClient,
        fathomRecordingImportId: id,
        fields,
        expectedUpdatedAt: undefined,
      });

      return true;
    },
  });
};
