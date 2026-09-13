import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { Buffer } from 'buffer';
import { isDefined } from 'twenty-shared/utils';

export const encodeCursor = (record: ObjectRecord) => {
  if (!('id' in record) || !isDefined(record.id)) {
    throw new Error('Record does not have an id');
  }

  const payload: {
    id: string;
    position?: number;
  } = {
    position: record.position,
    id: record.id,
  };

  // Mirrors the server's base64url cursors so both sides mint the same bytes for
  // a record. Translated by hand rather than encoded with 'base64url': the browser
  // Buffer polyfill only implements the standard alphabet and throws on that name
  return Buffer.from(JSON.stringify(payload), 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};
