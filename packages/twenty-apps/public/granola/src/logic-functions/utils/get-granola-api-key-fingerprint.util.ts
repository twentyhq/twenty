import { createHash } from 'node:crypto';

export const getGranolaApiKeyFingerprint = (apiKey: string): string =>
  createHash('sha256').update(apiKey.trim()).digest('hex');
