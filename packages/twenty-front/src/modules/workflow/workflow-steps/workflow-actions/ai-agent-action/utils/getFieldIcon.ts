import { FieldMetadataType } from 'twenty-shared/types';

export const getFieldIcon = (fieldType: FieldMetadataType): string => {
  switch (fieldType) {
    case FieldMetadataType.TEXT:
      return 'IconAbc';
    case FieldMetadataType.NUMBER:
      return 'IconText';
    case FieldMetadataType.BOOLEAN:
      return 'IconCheckbox';
    case FieldMetadataType.DATE:
      return 'IconCalendarEvent';
    default:
      return 'IconQuestionMark';
  }
};
