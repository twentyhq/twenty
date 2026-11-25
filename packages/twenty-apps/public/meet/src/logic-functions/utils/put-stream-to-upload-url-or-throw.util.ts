import { request as requestOverHttp, type IncomingMessage } from 'node:http';
import { request as requestOverHttps } from 'node:https';
import { Readable } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';

import { MeetException } from 'src/logic-functions/types/meet-exception.type';

async function* readStreamChunks(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        return;
      }

      yield value;
    }
  } finally {
    await reader.cancel();
  }
}

// node:http instead of fetch: fetch can buffer a streamed request body in memory.
export const putStreamToUploadUrlOrThrow = async ({
  stream,
  sizeBytes,
  uploadUrl,
  contentType,
  signal,
}: {
  stream: ReadableStream<Uint8Array>;
  sizeBytes: number;
  uploadUrl: string;
  contentType: string;
  signal: AbortSignal;
}): Promise<void> => {
  const url = new URL(uploadUrl);
  const requestUpload =
    url.protocol === 'http:' ? requestOverHttp : requestOverHttps;
  const uploadRequest = requestUpload(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, 'Content-Length': sizeBytes },
    signal,
  });
  const uploadResponsePromise = new Promise<IncomingMessage>(
    (resolve, reject) => {
      uploadRequest.once('response', resolve);
      uploadRequest.once('error', reject);
    },
  );

  const [, uploadResponse] = await Promise.all([
    pipeline(Readable.from(readStreamChunks(stream)), uploadRequest),
    uploadResponsePromise,
  ]);

  uploadResponse.resume();
  await finished(uploadResponse);

  const statusCode = uploadResponse.statusCode ?? 0;

  if (statusCode < 200 || statusCode >= 300) {
    throw new MeetException({
      message: `Video upload failed with status ${statusCode}`,
      code: 'FILE_UPLOAD_FAILED',
    });
  }
};
