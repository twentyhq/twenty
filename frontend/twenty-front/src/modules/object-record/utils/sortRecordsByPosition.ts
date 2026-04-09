import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const sortRecordsByPosition = (
  record1: ObjectRecord,
  record2: ObjectRecord,
) => {
  if (
    typeof record1.position == 'number' &&
    typeof record2.position == 'number'
  ) {
    return record1.position - record2.position;
  } else if (record1.position === 'first' || record2.position === 'last') {
    return -1;
  } else if (record2.position === 'first' || record1.position === 'last') {
    return 1;
  } else {
    return 0;
  }
};
