import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const isObjectWithId = (value: unknown): value is ObjectRecord =>
  isDefined(value) &&
  typeof value === 'object' &&
  'id' in value &&
  typeof value.id === 'string';
