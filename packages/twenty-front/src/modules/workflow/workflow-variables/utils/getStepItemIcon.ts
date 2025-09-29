import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { FieldMetadataType } from 'twenty-shared/types';

export const getStepItemIcon = ({
  itemType,
}: {
  itemType: InputSchemaPropertyType;
}) => {
  if (itemType === 'string' || itemType === FieldMetadataType.TEXT) {
    return 'IconAbc';
  }

  if (
    itemType === 'number' ||
    itemType === FieldMetadataType.NUMERIC ||
    itemType === FieldMetadataType.NUMBER
  ) {
    return 'Icon123';
  }

  if (itemType === 'boolean' || itemType === FieldMetadataType.BOOLEAN) {
    return 'IconCheckbox';
  }

  if (itemType === 'array' || itemType === FieldMetadataType.ARRAY) {
    return 'IconBrackets';
  }

  if (itemType === 'object') {
    return 'IconBraces';
  }

  if (itemType === 'unknown') {
    return 'IconQuestionMark';
  }

  return undefined;
};
