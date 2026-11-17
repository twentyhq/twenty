import { type RecordField } from '@/object-record/record-field/types/RecordField';

// A missing flag means canonical: the server defaults every view field to it
export const isCanonicalRecordField = (
  recordField: Pick<RecordField, 'isCanonical'>,
) => recordField.isCanonical !== false;
