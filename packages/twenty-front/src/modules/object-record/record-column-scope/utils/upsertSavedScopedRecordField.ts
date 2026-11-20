import { type RecordField } from '@/object-record/record-field/types/RecordField';

export const upsertSavedScopedRecordField = ({
  recordFields,
  savedRecordField,
}: {
  recordFields: RecordField[];
  savedRecordField: RecordField;
}): RecordField[] => {
  if (!recordFields.some(({ id }) => id === savedRecordField.id)) {
    return [...recordFields, savedRecordField];
  }

  return recordFields.map((recordField) =>
    recordField.id === savedRecordField.id
      ? { ...recordField, relationScope: savedRecordField.relationScope }
      : recordField,
  );
};
