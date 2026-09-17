import { createHash } from 'node:crypto';

export const hashShortLink = ({
  url,
  authoredUrl,
}: {
  url: string;
  authoredUrl: string;
}): string =>
  createHash('sha256').update(`${authoredUrl}\n${url}`).digest('hex');
