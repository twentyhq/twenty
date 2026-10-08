import { FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomRequestMediaDownloadPayload } from 'src/logic-functions/schemas/fathom-media-download-payload.schema';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';
import { reserveFathomImportSlots } from 'src/logic-functions/utils/reserve-fathom-import-slots.util';

export const enqueueFathomMediaDownloadRequest = async ({
  connectedAccountId,
  notBeforeDelayMilliseconds,
  ...payload
}: FathomRequestMediaDownloadPayload & {
  connectedAccountId: string;
  notBeforeDelayMilliseconds?: number;
}): Promise<void> => {
  const { slotDelays } = await reserveFathomImportSlots({
    connectedAccountId,
    slotCount: 1,
    notBeforeDelayMilliseconds,
  });

  await enqueueFathomJobsOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
    payloads: [payload],
    delayMs: slotDelays[0],
  });
};
