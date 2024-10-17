import { IconComponent } from 'twenty-ui';

export type TableFieldMetadata<ItemType> = {
  fieldLabel: string;
  fieldName: keyof ItemType;
  fieldType: 'string' | 'number';
  align: 'left' | 'right';
  FieldIcon?: IconComponent;
};
