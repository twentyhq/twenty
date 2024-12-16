import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

export const createCursor = (record: ObjectRecord) => {
  if (!('id' in record) || !isDefined(record.id)) {
    throw new Error('Record does not have an id');
  }

  const payload: {
    id: string;
    position?: number;
  } = {
    id: record.id,
  };

  if ('position' in record) {
    payload.position = record.position;
  }

  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
};
