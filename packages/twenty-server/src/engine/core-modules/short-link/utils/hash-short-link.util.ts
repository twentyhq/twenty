import { createHash } from 'node:crypto';

export const hashShortLink = ({
  authoredTemplateUrl,
  resolvedDestinationUrl,
}: {
  authoredTemplateUrl: string;
  resolvedDestinationUrl: string;
}): string =>
  createHash('sha256')
    .update(`${authoredTemplateUrl}\n${resolvedDestinationUrl}`)
    .digest('hex');
