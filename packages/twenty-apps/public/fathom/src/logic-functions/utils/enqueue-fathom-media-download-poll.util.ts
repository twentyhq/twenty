import { FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomImportMediaDownloadPayload } from 'src/logic-functions/schemas/fathom-media-download-payload.schema';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';
import { getFathomMediaDownloadPollDelay } from 'src/logic-functions/utils/get-fathom-media-download-poll-delay.util';
import { reserveFathomImportSlots } from 'src/logic-functions/utils/reserve-fathom-import-slots.util';

export const enqueueFathomMediaDownloadPoll = async ({
  connectedAccountId,
  notBeforeDelayMilliseconds,
  ...payload
}: FathomImportMediaDownloadPayload & {
  connectedAccountId: string;
  notBeforeDelayMilliseconds?: number;
}): Promise<void> => {
  const { slotDelays } = await reserveFathomImportSlots({
    connectedAccountId,
    slotCount: 1,
    notBeforeDelayMilliseconds: Math.max(
      notBeforeDelayMilliseconds ?? 0,
      getFathomMediaDownloadPollDelay(payload.attempt),
    ),
  });

  await enqueueFathomJobsOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
    payloads: [payload],
    delayMs: slotDelays[0],
  });
};
