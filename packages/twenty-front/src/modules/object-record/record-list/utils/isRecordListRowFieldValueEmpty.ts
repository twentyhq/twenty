import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldValueSourceDefinition } from '@/object-record/record-field/ui/utils/getFieldValueSourceDefinition';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const isRecordListRowFieldValueEmpty = ({
  fieldDefinition,
  record,
  coreRecordReferenceFields,
}: {
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>;
  record: ObjectRecord;
  coreRecordReferenceFields: CoreRecordReferenceField[];
}) => {
  const fieldValueSourceDefinition = getFieldValueSourceDefinition({
    fieldDefinition,
    coreRecordReferenceFields,
  });

  return isFieldValueEmpty({
    fieldDefinition: fieldValueSourceDefinition,
    fieldValue: record[fieldValueSourceDefinition.metadata.fieldName],
  });
};
