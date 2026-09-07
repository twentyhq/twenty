import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { isDefined } from 'src/utils/is-defined';

export const buildFathomMediaWriteFence = (
  writeContext: FathomMediaWriteContext,
) => ({
  id: { eq: writeContext.fathomRecordingImportId },
  connectedAccountId: { eq: writeContext.connectedAccountId },
  mediaImportClaimedAt: { eq: writeContext.claimedAt },
  mediaDownloadId: isDefined(writeContext.downloadId)
    ? { eq: writeContext.downloadId }
    : { is: 'NULL' as const },
});
