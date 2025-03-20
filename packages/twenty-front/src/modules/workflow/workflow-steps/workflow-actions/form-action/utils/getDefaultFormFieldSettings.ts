import { FieldMetadataType } from 'twenty-shared';

export const getDefaultFormFieldSettings = (type: FieldMetadataType) => {
  switch (type) {
    case FieldMetadataType.TEXT:
      return {
        label: 'Text',
        placeholder: 'Enter your text',
      };
    case FieldMetadataType.NUMBER:
      return {
        label: 'Number',
        placeholder: '1000',
      };
    default:
      return {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        placeholder: 'Enter your value',
      };
  }
};
