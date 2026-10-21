import { isDefined } from 'twenty-shared/utils';

import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getCoreRecordIdFieldDefinition } from '@/object-record/record-field/ui/utils/getCoreRecordIdFieldDefinition';
import { getMatchingCoreRecordReferenceFields } from '@/object-record/record-field/ui/utils/getMatchingCoreRecordReferenceFields';

export const getFieldValueSourceDefinition = ({
  fieldDefinition,
  coreRecordReferenceFields,
}: {
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>;
  coreRecordReferenceFields: CoreRecordReferenceField[];
}): Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'> => {
  const coreRecordReferenceField = getMatchingCoreRecordReferenceFields({
    coreRecordReferenceFields,
    objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
    fieldNames: [fieldDefinition.metadata.fieldName],
  }).at(0);

  return isDefined(coreRecordReferenceField)
    ? getCoreRecordIdFieldDefinition(coreRecordReferenceField)
    : fieldDefinition;
};
