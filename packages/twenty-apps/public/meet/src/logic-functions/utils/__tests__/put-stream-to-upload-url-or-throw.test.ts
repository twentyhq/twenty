import { isString } from '@sniptt/guards';
import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import { afterEach, assert, describe, expect, it, vi } from 'vitest';
import { isDefined } from 'twenty-sdk/utils';

import { putStreamToUploadUrlOrThrow } from 'src/logic-functions/utils/put-stream-to-upload-url-or-throw.util';

type ReceivedUpload = {
  method: string | undefined;
  headers: IncomingHttpHeaders;
  body: string;
};

const startedServers: Server[] = [];

const startUploadServer = async (
  statusCode: number,
): Promise<{ uploadUrl: string; receivedUploads: ReceivedUpload[] }> => {
  const receivedUploads: ReceivedUpload[] = [];
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => {
      receivedUploads.push({
        method: request.method,
        headers: request.headers,
        body: Buffer.concat(chunks).toString(),
      });
      response.statusCode = statusCode;
      response.end();
    });
  });

  startedServers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  assert(
    isDefined(address) && !isString(address),
    'The upload server has no port',
  );

  return {
    uploadUrl: `http://127.0.0.1:${address.port}/upload`,
    receivedUploads,
  };
};

describe('putStreamToUploadUrlOrThrow', () => {
  afterEach(() => {
    startedServers.splice(0).forEach((server) => server.close());
  });

  it('should stream the body to the upload URL with its size and type', async () => {
    const { uploadUrl, receivedUploads } = await startUploadServer(200);

    await putStreamToUploadUrlOrThrow({
      stream: new Blob(['meeting ', 'video']).stream(),
      sizeBytes: 13,
      uploadUrl,
      contentType: 'video/mp4',
      signal: AbortSignal.timeout(5_000),
    });

    expect(receivedUploads).toEqual([
      {
        method: 'PUT',
        headers: expect.objectContaining({
          'content-type': 'video/mp4',
          'content-length': '13',
        }),
        body: 'meeting video',
      },
    ]);
  });

  it('should fail when the upload is refused', async () => {
    const { uploadUrl } = await startUploadServer(403);

    await expect(
      putStreamToUploadUrlOrThrow({
        stream: new Blob(['meeting video']).stream(),
        sizeBytes: 13,
        uploadUrl,
        contentType: 'video/mp4',
        signal: AbortSignal.timeout(5_000),
      }),
    ).rejects.toMatchObject({ code: 'FILE_UPLOAD_FAILED' });
  });

  it('should stop reading the download when the upload connection drops', async () => {
    const server = createServer((request) =>
      request.once('data', () => request.socket.destroy()),
    );

    startedServers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );

    const address = server.address();

    assert(
      isDefined(address) && !isString(address),
      'The upload server has no port',
    );

    const download = { isCanceled: false };

    await expect(
      putStreamToUploadUrlOrThrow({
        stream: new ReadableStream<Uint8Array>({
          pull: (controller) => controller.enqueue(new Uint8Array(65_536)),
          cancel: () => {
            download.isCanceled = true;
          },
        }),
        sizeBytes: 100 * 1024 * 1024,
        uploadUrl: `http://127.0.0.1:${address.port}/upload`,
        contentType: 'video/mp4',
        signal: AbortSignal.timeout(5_000),
      }),
    ).rejects.toThrow();

    await vi.waitFor(() => expect(download.isCanceled).toBe(true));
  });
});
