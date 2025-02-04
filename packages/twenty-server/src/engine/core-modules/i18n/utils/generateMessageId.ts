import crypto from 'crypto';

const UNIT_SEPARATOR = '\u001F';

export function generateMessageId(msg: string, context = '') {
  return crypto
    .createHash('sha256')
    .update(msg + UNIT_SEPARATOR + (context || ''))
    .digest('base64')
    .slice(0, 6);
}
