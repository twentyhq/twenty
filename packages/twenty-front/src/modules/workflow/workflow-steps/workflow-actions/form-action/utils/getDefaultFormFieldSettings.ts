import { FieldMetadataType } from 'twenty-shared';
import { v4 } from 'uuid';

export const getDefaultFormFieldSettings = (type: FieldMetadataType) => {
  switch (type) {
    case FieldMetadataType.TEXT:
      return {
        id: v4(),
        name: 'text',
        label: 'Text',
        placeholder: 'Enter your text',
      };
    case FieldMetadataType.NUMBER:
      return {
        id: v4(),
        name: 'number',
        label: 'Number',
        placeholder: '1000',
      };
    default:
      return {
        id: v4(),
        name: '',
        label: type.charAt(0).toUpperCase() + type.slice(1),
        placeholder: 'Enter your value',
      };
  }
};
