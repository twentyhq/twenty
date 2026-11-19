import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';

export const findCanonicalRecordField = <
  TRecordField extends Pick<RecordField, 'fieldMetadataItemId' | 'isCanonical'>,
>({
  recordFields,
  fieldMetadataItemId,
}: {
  recordFields: TRecordField[];
  fieldMetadataItemId: string;
}) =>
  recordFields.find(
    (recordField) =>
      recordField.fieldMetadataItemId === fieldMetadataItemId &&
      isCanonicalRecordField(recordField),
  );
