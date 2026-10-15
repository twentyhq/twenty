import { createHash } from 'crypto';

export const computeSriIntegrity = ({ source }: { source: Buffer }): string =>
  `sha512-${createHash('sha512').update(source).digest('base64')}`;
