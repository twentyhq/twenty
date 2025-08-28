import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTypeCompatibleWithRecordId = (
  type?: InputSchemaPropertyType,
): boolean => {
  return (
    !type ||
    type === 'string' ||
    type === 'unknown' ||
    type === FieldMetadataType.UUID
  );
};
