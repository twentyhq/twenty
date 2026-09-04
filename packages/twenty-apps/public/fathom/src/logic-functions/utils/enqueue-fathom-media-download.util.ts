import {
  FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
  FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  type FathomImportMediaDownloadPayload,
  type FathomRequestMediaDownloadPayload,
} from 'src/logic-functions/types/fathom-media-download-payload.type';
import { enqueueFathomJobOrThrow } from 'src/logic-functions/utils/enqueue-fathom-job-or-throw.util';
import { getFathomMediaDownloadPollDelay } from 'src/logic-functions/utils/get-fathom-media-download-poll-delay.util';

export const enqueueFathomMediaDownloadRequest = async (
  payload: FathomRequestMediaDownloadPayload,
): Promise<void> => {
  await enqueueFathomJobOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
    payload: { ...payload },
  });
};

export const enqueueFathomMediaDownloadPoll = async (
  payload: FathomImportMediaDownloadPayload,
): Promise<void> => {
  await enqueueFathomJobOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
    payload: { ...payload },
    delayMs: getFathomMediaDownloadPollDelay(payload.attempt),
  });
};
