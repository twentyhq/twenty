import { getFieldNameFromRelationRecordKey } from 'src/engine/api/common/utils/get-field-name-from-relation-record-key.util';

// Walk records, select or relations maps through this: an aliased relation sits under `fieldName::alias`
export const getRecordFieldEntries = <TValue>(
  record: Record<string, TValue>,
): { recordKey: string; fieldName: string; value: TValue }[] =>
  Object.entries(record).map(([recordKey, value]) => ({
    recordKey,
    fieldName: getFieldNameFromRelationRecordKey(recordKey),
    value,
  }));
