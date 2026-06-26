import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isFreshlyCreatedRecord = (record: ObjectRecord): boolean => {
  const createdAt = record.createdAt;
  const updatedAt = record.updatedAt;

  if (!isDefined(createdAt) || !isDefined(updatedAt)) {
    return false;
  }

  return new Date(createdAt).getTime() === new Date(updatedAt).getTime();
};
