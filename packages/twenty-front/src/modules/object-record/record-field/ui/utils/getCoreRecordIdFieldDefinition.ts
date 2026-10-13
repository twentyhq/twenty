import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getCoreRecordIdFieldDefinition = (
  coreRecordReferenceField: CoreRecordReferenceField,
): Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'> => ({
  type: FieldMetadataType.UUID,
  metadata: { fieldName: coreRecordReferenceField.coreRecordIdFieldName },
});
