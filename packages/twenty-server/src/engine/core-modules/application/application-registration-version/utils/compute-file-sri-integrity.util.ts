import { createHash } from 'crypto';
import { createReadStream } from 'fs';

export const computeFileSriIntegrity = async (
  filePath: string,
): Promise<string> => {
  const hash = createHash('sha512');

  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }

  return `sha512-${hash.digest('base64')}`;
};
