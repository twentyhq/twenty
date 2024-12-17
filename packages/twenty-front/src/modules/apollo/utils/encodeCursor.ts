import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

import { Buffer } from 'buffer';

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

  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
};
