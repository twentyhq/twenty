// SOURCING: none — pure logic, no upstream component applies
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

const isRecordWithId = (value: unknown): value is ObjectRecord =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof (value as { id: unknown }).id === 'string' &&
  (value as { id: string }).id.length > 0;

export const extractConnectedRecords = (value: unknown): ObjectRecord[] => {
  if (!isDefined(value)) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractConnectedRecords(item));
  }

  if (typeof value !== 'object') {
    return [];
  }

  const asRecord = value as {
    id?: unknown;
    edges?: unknown;
    node?: unknown;
  };

  if (Array.isArray(asRecord.edges)) {
    return asRecord.edges.flatMap((edge) => extractConnectedRecords(edge));
  }

  if (isDefined(asRecord.node)) {
    return extractConnectedRecords(asRecord.node);
  }

  if (isRecordWithId(value)) {
    return [value];
  }

  return [];
};
