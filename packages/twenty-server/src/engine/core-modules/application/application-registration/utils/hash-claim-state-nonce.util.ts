import { createHash } from 'crypto';

export const hashClaimStateNonce = ({ nonce }: { nonce: string }): string =>
  createHash('sha256').update(nonce).digest('hex');
