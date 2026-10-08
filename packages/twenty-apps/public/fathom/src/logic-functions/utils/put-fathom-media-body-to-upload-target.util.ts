import { request as requestOverHttp, type IncomingMessage } from 'node:http';
import { request as requestOverHttps } from 'node:https';
import { Readable } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';

import { FATHOM_MEDIA_UPLOAD_TIMEOUT_MILLISECONDS } from 'src/constants/fathom.constant';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

type MediaUploadTarget = {
  uploadUrl: string;
  contentType: string;
};

const HTTP_STATUS_OK_LOWER_BOUND = 200;
const HTTP_STATUS_OK_UPPER_BOUND = 300;

export const putFathomMediaBodyToUploadTarget = async ({
  callRecordingId,
  mediaDownloadBody,
  fileName,
  sizeBytes,
  uploadTarget,
}: {
  callRecordingId: string;
  mediaDownloadBody: ReadableStream<Uint8Array>;
  fileName: string;
  sizeBytes: number;
  uploadTarget: MediaUploadTarget;
}): Promise<void> => {
  const mediaDownloadReader = mediaDownloadBody.getReader();
  const mediaDownloadReadable = Readable.from(
    readMediaDownloadBody({ reader: mediaDownloadReader }),
  );
  // A pending read only settles once the reader is cancelled, so a stalled
  // download has to be cancelled before waiting for the pipeline to unwind.
  const cancelMediaDownload = async () => {
    await mediaDownloadReader.cancel().catch((error: unknown) => {
      console.warn(
        `[fathom] media download body cancellation failed callRecordingId=${callRecordingId} fileName=${fileName}: ${toErrorMessage(error)}`,
      );
    });
  };

  await streamMediaDownloadReadableToUploadTarget({
    cancelMediaDownload,
    fileName,
    mediaDownloadReadable,
    sizeBytes,
    uploadTarget,
  }).catch(async (error: unknown) => {
    await cancelMediaDownload();

    throw error;
  });
};

const readMediaDownloadBody = async function* ({
  reader,
}: {
  reader: ReadableStreamDefaultReader<Uint8Array>;
}) {
  let isComplete = false;

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) {
        isComplete = true;
        return;
      }

      yield chunk.value;
    }
  } finally {
    if (!isComplete) {
      await reader.cancel().catch(() => undefined);
    }

    reader.releaseLock();
  }
};

const streamMediaDownloadReadableToUploadTarget = async ({
  cancelMediaDownload,
  fileName,
  mediaDownloadReadable,
  sizeBytes,
  uploadTarget,
}: {
  cancelMediaDownload: () => Promise<void>;
  fileName: string;
  mediaDownloadReadable: Readable;
  sizeBytes: number;
  uploadTarget: MediaUploadTarget;
}): Promise<void> => {
  const uploadUrl = new URL(uploadTarget.uploadUrl);
  const requestUpload =
    uploadUrl.protocol === 'http:' ? requestOverHttp : requestOverHttps;
  const uploadRequest = requestUpload(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': uploadTarget.contentType,
      'Content-Length': sizeBytes,
    },
    signal: AbortSignal.timeout(FATHOM_MEDIA_UPLOAD_TIMEOUT_MILLISECONDS),
  });

  const uploadResponsePromise = new Promise<IncomingMessage>(
    (resolve, reject) => {
      uploadRequest.once('response', resolve);
      uploadRequest.once('error', reject);
    },
  );
  const uploadPipelinePromise = pipeline(mediaDownloadReadable, uploadRequest);

  const uploadResponse = await Promise.race([
    uploadResponsePromise,
    uploadPipelinePromise.then(async () => await uploadResponsePromise),
  ]).catch(async (error: unknown) => {
    mediaDownloadReadable.destroy();
    uploadRequest.destroy();
    await cancelMediaDownload();
    await uploadPipelinePromise.catch(() => undefined);

    throw error;
  });

  uploadResponse.resume();

  const uploadResponseBodyDrainPromise = finished(uploadResponse);
  const uploadStatusCode = uploadResponse.statusCode ?? 0;

  if (
    uploadStatusCode < HTTP_STATUS_OK_LOWER_BOUND ||
    uploadStatusCode >= HTTP_STATUS_OK_UPPER_BOUND
  ) {
    const uploadError = new Error(
      `upload of ${fileName} failed with status ${uploadStatusCode}`,
    );

    mediaDownloadReadable.destroy(uploadError);
    uploadRequest.destroy(uploadError);
    await cancelMediaDownload();

    await Promise.allSettled([
      uploadPipelinePromise,
      uploadResponseBodyDrainPromise,
    ]);

    throw uploadError;
  }

  await Promise.all([uploadPipelinePromise, uploadResponseBodyDrainPromise]);
};
