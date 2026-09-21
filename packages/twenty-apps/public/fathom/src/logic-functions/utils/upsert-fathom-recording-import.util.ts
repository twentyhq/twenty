import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomRecordingImportFields } from 'src/logic-functions/types/fathom-recording-import-fields.type';
import { isDefined } from 'src/utils/is-defined';

export const upsertFathomRecordingImport = async ({
  coreApiClient,
  fathomRecordingImportId,
  fields,
  expectedUpdatedAt,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  fathomRecordingImportId: string;
  fields: FathomRecordingImportFields & { recordingId: string };
  expectedUpdatedAt: string | undefined;
}): Promise<void> => {
  if (!isDefined(expectedUpdatedAt)) {
    try {
      await coreApiClient.mutation({
        createFathomRecordingImport: {
          __args: {
            data: { id: fathomRecordingImportId, ...fields },
          },
          id: true,
        },
      });

      return;
    } catch (error) {
      const result = await coreApiClient.query({
        fathomRecordingImports: {
          __args: {
            filter: { id: { eq: fathomRecordingImportId } },
            first: 1,
          },
          edges: { node: { updatedAt: true } },
        },
      });
      const currentUpdatedAt =
        result.fathomRecordingImports?.edges[0]?.node?.updatedAt;

      if (!isDefined(currentUpdatedAt)) {
        throw error;
      }

      return upsertFathomRecordingImport({
        coreApiClient,
        fathomRecordingImportId,
        fields,
        expectedUpdatedAt: currentUpdatedAt,
      });
    }
  }

  const result = await coreApiClient.mutation({
    updateFathomRecordingImports: {
      __args: {
        filter: {
          id: { eq: fathomRecordingImportId },
          updatedAt: { eq: expectedUpdatedAt },
        },
        data: fields,
      },
      id: true,
    },
  });

  if ((result.updateFathomRecordingImports ?? []).length === 0) {
    throw new Error('Fathom recording changed during import; retry the import');
  }
};
