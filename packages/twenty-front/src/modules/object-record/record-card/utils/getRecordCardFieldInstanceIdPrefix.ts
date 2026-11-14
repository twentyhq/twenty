import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';

// An added column shares its field with the canonical one, so it needs its own editor and anchor ids
export const getRecordCardFieldInstanceIdPrefix = ({
  cardInstanceIdPrefix,
  recordField,
}: {
  cardInstanceIdPrefix: string;
  recordField: Pick<RecordField, 'id' | 'isCanonical'>;
}) =>
  isCanonicalRecordField(recordField)
    ? cardInstanceIdPrefix
    : `${cardInstanceIdPrefix}-${recordField.id}`;
