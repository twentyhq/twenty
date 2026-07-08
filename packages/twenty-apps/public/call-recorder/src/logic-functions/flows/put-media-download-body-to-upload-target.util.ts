import {
  request as requestOverHttp,
  type ClientRequest,
  type IncomingMessage,
} from 'node:http';
import { request as requestOverHttps } from 'node:https';
import { Readable } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';
import { type ReadableStream as NodeWebReadableStream } from 'node:stream/web';

type MediaUploadTarget = {
  uploadUrl: string;
  contentType: string;
};

const MEDIA_UPLOAD_TIMEOUT_MS = 14 * 60 * 1000;
const HTTP_STATUS_OK_LOWER_BOUND = 200;
const HTTP_STATUS_OK_UPPER_BOUND = 300;

export const putMediaDownloadBodyToUploadTarget = async ({
  mediaDownloadBody,
  fileName,
  sizeBytes,
  uploadTarget,
}: {
  mediaDownloadBody: ReadableStream<Uint8Array>;
  fileName: string;
  sizeBytes: number;
  uploadTarget: MediaUploadTarget;
}): Promise<void> => {
  // Use node:http instead of fetch here: fetch can buffer ReadableStream
  // request bodies in memory, which OOMs Lambda for large recordings.
  const mediaDownloadReadable = Readable.fromWeb(
    mediaDownloadBody as NodeWebReadableStream<Uint8Array>,
  );

  await streamMediaDownloadReadableToUploadTarget({
    fileName,
    mediaDownloadReadable,
    sizeBytes,
    uploadTarget,
  });
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
    signal: AbortSignal.timeout(MEDIA_UPLOAD_TIMEOUT_MS),
  });

  const uploadResponsePromise = waitForUploadResponse({ uploadRequest });
  const uploadPipelinePromise = pipeline(mediaDownloadReadable, uploadRequest);

  let uploadResponse: IncomingMessage;

  try {
    uploadResponse = await waitForUploadResponseOrPipelineFailure({
      uploadPipelinePromise,
      uploadResponsePromise,
    });
  } catch (error) {
    mediaDownloadReadable.destroy();
    uploadRequest.destroy();
    await uploadPipelinePromise.catch(() => undefined);

    throw error;
  }

  const uploadResponseBodyDrainPromise = drainUploadResponseBody({
    uploadResponse,
  });
  const uploadStatusCode = uploadResponse.statusCode ?? 0;

  if (!isSuccessfulUploadStatusCode(uploadStatusCode)) {
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

const waitForUploadResponse = ({
  uploadRequest,
}: {
  uploadRequest: ClientRequest;
}): Promise<IncomingMessage> =>
  new Promise<IncomingMessage>((resolve, reject) => {
    uploadRequest.once('response', resolve);
    uploadRequest.once('error', reject);
  });

const waitForUploadResponseOrPipelineFailure = async ({
  uploadPipelinePromise,
  uploadResponsePromise,
}: {
  uploadPipelinePromise: Promise<void>;
  uploadResponsePromise: Promise<IncomingMessage>;
}): Promise<IncomingMessage> =>
  Promise.race([
    uploadResponsePromise,
    uploadPipelinePromise.then(async () => await uploadResponsePromise),
  ]);

const drainUploadResponseBody = async ({
  uploadResponse,
}: {
  uploadResponse: IncomingMessage;
}): Promise<void> => {
  uploadResponse.resume();

  await finished(uploadResponse);
};

const isSuccessfulUploadStatusCode = (uploadStatusCode: number): boolean =>
  uploadStatusCode >= HTTP_STATUS_OK_LOWER_BOUND &&
  uploadStatusCode < HTTP_STATUS_OK_UPPER_BOUND;
