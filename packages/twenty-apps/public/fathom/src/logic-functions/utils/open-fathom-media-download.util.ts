import { isNonEmptyString, isNull, isUndefined } from '@sniptt/guards';
import { type RecordingDownloadFile } from 'fathom-typescript/sdk/models/shared';

import {
  FATHOM_MEDIA_DOWNLOAD_TIMEOUT_MILLISECONDS,
  FATHOM_MEDIA_MAX_FILE_SIZE_BYTES,
} from 'src/constants/fathom.constant';
import { cancelFathomMediaDownloadBody } from 'src/logic-functions/utils/cancel-fathom-media-download-body.util';

export type OpenFathomMediaDownloadResult =
  | { outcome: 'opened'; body: ReadableStream<Uint8Array>; sizeBytes: number }
  | { outcome: 'empty' }
  | { outcome: 'too-large'; sizeBytes: number };

export const openFathomMediaDownload = async ({
  callRecordingId,
  fileName,
  downloadFile,
}: {
  callRecordingId: string;
  fileName: string;
  downloadFile: Pick<RecordingDownloadFile, 'url'>;
}): Promise<OpenFathomMediaDownloadResult> => {
  const response = await fetch(downloadFile.url, {
    signal: AbortSignal.timeout(FATHOM_MEDIA_DOWNLOAD_TIMEOUT_MILLISECONDS),
  });
  const contentLengthBytes = parseContentLengthBytes(
    response.headers.get('content-length'),
  );

  if (
    !response.ok ||
    isUndefined(contentLengthBytes) ||
    contentLengthBytes > FATHOM_MEDIA_MAX_FILE_SIZE_BYTES ||
    contentLengthBytes === 0
  ) {
    await cancelFathomMediaDownloadBody({
      callRecordingId,
      fileName,
      body: response.body,
    });

    if (!response.ok) {
      throw new Error(`download failed with status ${response.status}`);
    }

    if (isUndefined(contentLengthBytes)) {
      throw new Error('download response is missing content-length');
    }

    if (contentLengthBytes > FATHOM_MEDIA_MAX_FILE_SIZE_BYTES) {
      return { outcome: 'too-large', sizeBytes: contentLengthBytes };
    }

    return { outcome: 'empty' };
  }

  if (isNull(response.body)) {
    throw new Error('download returned no body');
  }

  return {
    outcome: 'opened',
    body: response.body,
    sizeBytes: contentLengthBytes,
  };
};

const parseContentLengthBytes = (
  headerValue: string | null,
): number | undefined => {
  if (!isNonEmptyString(headerValue)) {
    return undefined;
  }

  const parsedBytes = Number(headerValue.trim());

  return Number.isSafeInteger(parsedBytes) && parsedBytes >= 0
    ? parsedBytes
    : undefined;
};
