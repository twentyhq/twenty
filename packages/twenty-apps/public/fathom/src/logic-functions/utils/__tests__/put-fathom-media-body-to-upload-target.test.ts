import { createServer, type Server } from 'node:http';

import { afterEach, describe, expect, it } from 'vitest';

import { putFathomMediaBodyToUploadTarget } from 'src/logic-functions/utils/put-fathom-media-body-to-upload-target.util';

const openServers: Server[] = [];

const startUploadServer = async ({
  statusCode,
  uploadedChunks,
  receivedHeaders,
}: {
  statusCode: number;
  uploadedChunks?: Buffer[];
  receivedHeaders?: Record<string, string | string[] | undefined>;
}): Promise<string> => {
  const server = createServer((request, response) => {
    if (receivedHeaders !== undefined) {
      Object.assign(receivedHeaders, request.headers);
    }

    request.on('data', (chunk: Buffer) => uploadedChunks?.push(chunk));
    request.on('end', () => {
      response.writeHead(statusCode);
      response.end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  openServers.push(server);

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Upload test server did not bind a TCP port');
  }

  return `http://127.0.0.1:${address.port}/upload`;
};

const buildMediaBody = (bytes: number[]): ReadableStream<Uint8Array> =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(Uint8Array.from(bytes));
      controller.close();
    },
  });

afterEach(async () => {
  await Promise.all(
    openServers
      .splice(0)
      .map(
        async (server) =>
          await new Promise<void>((resolve, reject) =>
            server.close((error) =>
              error === undefined ? resolve() : reject(error),
            ),
          ),
      ),
  );
});

describe('putFathomMediaBodyToUploadTarget', () => {
  it('streams the media body to an upload target with its declared headers', async () => {
    const uploadedChunks: Buffer[] = [];
    const receivedHeaders: Record<string, string | string[] | undefined> = {};
    const uploadUrl = await startUploadServer({
      statusCode: 200,
      uploadedChunks,
      receivedHeaders,
    });

    await putFathomMediaBodyToUploadTarget({
      callRecordingId: 'call-recording-id',
      fileName: 'video.mp4',
      mediaDownloadBody: buildMediaBody([1, 2, 3, 4]),
      sizeBytes: 4,
      uploadTarget: { uploadUrl, contentType: 'video/mp4' },
    });

    expect(receivedHeaders['content-type']).toBe('video/mp4');
    expect(receivedHeaders['content-length']).toBe('4');
    expect(Buffer.concat(uploadedChunks)).toEqual(Buffer.from([1, 2, 3, 4]));
  });

  it('rejects a failed storage response', async () => {
    const uploadUrl = await startUploadServer({ statusCode: 500 });

    await expect(
      putFathomMediaBodyToUploadTarget({
        callRecordingId: 'call-recording-id',
        fileName: 'video.mp4',
        mediaDownloadBody: buildMediaBody([1, 2, 3, 4]),
        sizeBytes: 4,
        uploadTarget: { uploadUrl, contentType: 'video/mp4' },
      }),
    ).rejects.toThrow('upload of video.mp4 failed with status 500');
  });

  it('cancels the media body when the upload request cannot be created', async () => {
    let isCancelled = false;
    const mediaDownloadBody = new ReadableStream<Uint8Array>({
      cancel() {
        isCancelled = true;
      },
    });

    await expect(
      putFathomMediaBodyToUploadTarget({
        callRecordingId: 'call-recording-id',
        fileName: 'video.mp4',
        mediaDownloadBody,
        sizeBytes: 4,
        uploadTarget: {
          uploadUrl: 'not-a-valid-upload-url',
          contentType: 'video/mp4',
        },
      }),
    ).rejects.toThrow();

    expect(isCancelled).toBe(true);
  });
});
