import { createHash } from 'crypto';

export const hashTelegramLinkToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
