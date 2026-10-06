import { createHash } from 'node:crypto';

export const hashContent = (content: string | Buffer) =>
  createHash('sha256').update(content).digest('hex');
