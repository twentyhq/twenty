import { ALIASED_RELATION_RECORD_KEY_SEPARATOR } from 'src/engine/api/common/constants/aliased-relation-record-key-separator.constant';

// Walk records, select or relations maps through this: an aliased relation sits under `fieldName::alias`
export const getRecordFieldEntries = <TValue>(
  record: Record<string, TValue>,
): { recordKey: string; fieldName: string; value: TValue }[] =>
  Object.entries(record).map(([recordKey, value]) => ({
    recordKey,
    fieldName: recordKey.split(ALIASED_RELATION_RECORD_KEY_SEPARATOR)[0],
    value,
  }));
