import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { type FathomRecordingImportFields } from 'src/logic-functions/types/fathom-recording-import-fields.type';
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
  if (fathomRecordingImports.length > 1) {
    try {
      await coreApiClient.mutation({
        createFathomRecordingImports: {
          __args: {
            data: fathomRecordingImports.map(({ id, fields }) => ({
              id,
              ...fields,
            })),
          },
          id: true,
        },
      });

      return;
    } catch (error) {
      if (error instanceof RetryableLogicFunctionError) {
        throw error;
      }
    }
  }

  for (const { id, fields } of fathomRecordingImports) {
    await upsertFathomRecordingImport({
      coreApiClient,
      fathomRecordingImportId: id,
      fields,
      expectedUpdatedAt: undefined,
    });
  }
};
