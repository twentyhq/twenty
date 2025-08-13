import { type Readable } from 'stream';

export const readFileContent = async (stream: Readable): Promise<string> => {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf8');
};
