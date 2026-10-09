import { createHash } from 'node:crypto';
import { type Readable } from 'node:stream';

export const doesFileStreamMatchHash = async ({
  stream,
  size,
  sha256,
}: {
  stream: Readable;
  size: number;
  sha256: string;
}): Promise<boolean> => {
  const hash = createHash('sha256');
  let bytesRead = 0;

  for await (const chunk of stream) {
    bytesRead += chunk.length;
    if (bytesRead > size) {
      return false;
    }
    hash.update(chunk);
  }

  return bytesRead === size && hash.digest('hex') === sha256.toLowerCase();
};
