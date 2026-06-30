import { createHash } from 'node:crypto';

const UNIT_SEPARATOR = '\u001F';

export const generateMessageId = (message: string, context = ''): string =>
  createHash('sha256')
    .update(message + UNIT_SEPARATOR + (context || ''))
    .digest('base64')
    .slice(0, 6);
