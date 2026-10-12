import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';

import { doesFileStreamMatchHash } from 'src/engine/core-modules/application/application-development/utils/does-file-stream-match-hash.util';

const contents = Buffer.from('export const main = () => "hello";');
const sha256 = createHash('sha256').update(contents).digest('hex');

describe('doesFileStreamMatchHash', () => {
  it.each([sha256, sha256.toUpperCase()])(
    'matches chunked content with hash %s',
    async (expectedHash) => {
      const stream = Readable.from([
        contents.subarray(0, 5),
        contents.subarray(5),
      ]);

      await expect(
        doesFileStreamMatchHash({
          stream,
          size: contents.length,
          sha256: expectedHash,
        }),
      ).resolves.toBe(true);
    },
  );

  it('rejects different bytes with the same size', async () => {
    await expect(
      doesFileStreamMatchHash({
        stream: Readable.from([Buffer.alloc(contents.length)]),
        size: contents.length,
        sha256,
      }),
    ).resolves.toBe(false);
  });

  it('rejects a truncated stream', async () => {
    await expect(
      doesFileStreamMatchHash({
        stream: Readable.from([contents.subarray(1)]),
        size: contents.length,
        sha256,
      }),
    ).resolves.toBe(false);
  });

  it('stops and destroys a stream larger than its declared size', async () => {
    const stream = Readable.from([contents, Buffer.from('extra')]);

    await expect(
      doesFileStreamMatchHash({ stream, size: contents.length, sha256 }),
    ).resolves.toBe(false);
    expect(stream.destroyed).toBe(true);
  });

  it('propagates a storage read failure', async () => {
    const stream = Readable.from(
      (async function* () {
        yield contents.subarray(0, 5);
        throw new Error('Storage read failed');
      })(),
    );

    await expect(
      doesFileStreamMatchHash({ stream, size: contents.length, sha256 }),
    ).rejects.toThrow('Storage read failed');
  });
});
