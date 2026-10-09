import { createServer, type Server } from 'node:http';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/constants/fathom.constant', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/constants/fathom.constant')>()),
  FATHOM_MEDIA_UPLOAD_TIMEOUT_MILLISECONDS: 100,
}));

const { putFathomMediaBodyToUploadTarget } =
  await import('src/logic-functions/utils/put-fathom-media-body-to-upload-target.util');

const openServers: Server[] = [];

const startUploadServer = async (): Promise<string> => {
  const server = createServer((request) => {
    request.resume();
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  openServers.push(server);

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Upload test server did not bind a TCP port');
  }

  return `http://127.0.0.1:${address.port}/upload`;
};

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map(
      async (server) =>
        await new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    ),
  );
});

describe('putFathomMediaBodyToUploadTarget upload timeout', () => {
  it('rejects and cancels a download that stalls after its first chunk', async () => {
    let isCancelled = false;
    const mediaDownloadBody = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2]));
      },
      cancel() {
        isCancelled = true;
      },
    });
    const uploadUrl = await startUploadServer();

    await expect(
      putFathomMediaBodyToUploadTarget({
        callRecordingId: 'call-recording-id',
        fileName: 'video.mp4',
        mediaDownloadBody,
        sizeBytes: 4,
        uploadTarget: { uploadUrl, contentType: 'video/mp4' },
      }),
    ).rejects.toThrow();

    expect(isCancelled).toBe(true);
  });
});
