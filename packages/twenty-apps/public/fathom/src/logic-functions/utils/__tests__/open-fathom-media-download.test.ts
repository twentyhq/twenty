import { createServer, type Server } from 'node:http';

import { afterEach, describe, expect, it } from 'vitest';

import { openFathomMediaDownload } from 'src/logic-functions/utils/open-fathom-media-download.util';

const openServers: Server[] = [];

const startEmptyDownloadServer = async (): Promise<string> => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-length': '0' });
    response.end();
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  openServers.push(server);

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Download test server did not bind a TCP port');
  }

  return `http://127.0.0.1:${address.port}/download`;
};

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
});
