import { createServer, type Server } from 'node:http';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/constants/fathom.constant', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/constants/fathom.constant')>()),
  FATHOM_MEDIA_DOWNLOAD_TIMEOUT_MILLISECONDS: 50,
}));

const { openFathomMediaDownload } =
  await import('src/logic-functions/utils/open-fathom-media-download.util');

const openServers: Server[] = [];
const pendingResponseTimers: NodeJS.Timeout[] = [];

const startDownloadServer = async (
  handleRequest: Parameters<typeof createServer>[1],
): Promise<string> => {
  const server = createServer(handleRequest);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  openServers.push(server);

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Download test server did not bind a TCP port');
  }

  return `http://127.0.0.1:${address.port}/download`;
};

const startEmptyDownloadServer = async (): Promise<string> =>
  await startDownloadServer((_request, response) => {
    response.writeHead(200, { 'content-length': '0' });
    response.end();
  });

const readBodyBytes = async (
  body: ReadableStream<Uint8Array>,
): Promise<number[]> => {
  const bytes: number[] = [];

  for await (const chunk of body) {
    bytes.push(...chunk);
  }

  return bytes;
};

afterEach(async () => {
  pendingResponseTimers.splice(0).forEach(clearTimeout);
  openServers.forEach((server) => server.closeAllConnections());
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

describe('openFathomMediaDownload', () => {
  it('reports an empty provider download without opening an upload', async () => {
    const downloadUrl = await startEmptyDownloadServer();

    await expect(
      openFathomMediaDownload({
        callRecordingId: 'call-recording-id',
        fileName: 'video.mp4',
        downloadFile: { url: downloadUrl },
      }),
    ).resolves.toEqual({ outcome: 'empty' });
  });

  it('keeps streaming a body that outlasts the response timeout', async () => {
    const downloadUrl = await startDownloadServer((_request, response) => {
      response.writeHead(200, { 'content-length': '4' });
      response.write(Uint8Array.from([1, 2]));
      pendingResponseTimers.push(
        setTimeout(() => response.end(Uint8Array.from([3, 4])), 200),
      );
    });

    const download = await openFathomMediaDownload({
      callRecordingId: 'call-recording-id',
      fileName: 'video.mp4',
      downloadFile: { url: downloadUrl },
    });

    if (download.outcome !== 'opened') {
      throw new Error(`Expected an opened download, got ${download.outcome}`);
    }

    expect(await readBodyBytes(download.body)).toEqual([1, 2, 3, 4]);
  });

  it('gives up when the response headers do not arrive in time', async () => {
    const downloadUrl = await startDownloadServer(() => undefined);

    await expect(
      openFathomMediaDownload({
        callRecordingId: 'call-recording-id',
        fileName: 'video.mp4',
        downloadFile: { url: downloadUrl },
      }),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
  });
});
