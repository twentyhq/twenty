import { request as requestOverHttp, type IncomingMessage } from 'node:http';
import { request as requestOverHttps } from 'node:https';
import { Readable } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';

import { FATHOM_MEDIA_UPLOAD_TIMEOUT_MILLISECONDS } from 'src/constants/fathom.constant';
import { cancelFathomMediaDownloadBody } from 'src/logic-functions/utils/cancel-fathom-media-download-body.util';

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
  const mediaDownloadReadable = Readable.from(
    readMediaDownloadBody({ mediaDownloadBody }),
  );

  await streamMediaDownloadReadableToUploadTarget({
    fileName,
    mediaDownloadReadable,
    sizeBytes,
    uploadTarget,
  }).catch(async (error: unknown) => {
    await cancelFathomMediaDownloadBody({
      body: mediaDownloadBody,
      callRecordingId,
      fileName,
    });

    throw error;
  });
};

const readMediaDownloadBody = async function* ({
  mediaDownloadBody,
}: {
  mediaDownloadBody: ReadableStream<Uint8Array>;
}) {
  const reader = mediaDownloadBody.getReader();
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
  fileName,
  mediaDownloadReadable,
  sizeBytes,
  uploadTarget,
}: {
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

    await Promise.allSettled([
      uploadPipelinePromise,
      uploadResponseBodyDrainPromise,
    ]);

    throw uploadError;
  }

  await Promise.all([uploadPipelinePromise, uploadResponseBodyDrainPromise]);
};
