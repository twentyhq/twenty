import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomRecordingImportFields } from 'src/logic-functions/types/fathom-recording-import-fields.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { buildFathomMediaWriteFence } from 'src/logic-functions/utils/build-fathom-media-write-fence.util';

export const updateFathomRecordingImport = async ({
  coreApiClient,
  fields,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  writeContext: FathomMediaWriteContext;
  fields: Pick<
    FathomRecordingImportFields,
    'mediaFailureReason' | 'mediaDownloadId' | 'mediaUploadCheckpoint'
  >;
}): Promise<boolean> => {
  const result = await coreApiClient.mutation({
    updateFathomRecordingImports: {
      __args: {
        filter: buildFathomMediaWriteFence(writeContext),
        data: fields,
      },
      id: true,
    },
  });

  return (result.updateFathomRecordingImports ?? []).length > 0;
};
