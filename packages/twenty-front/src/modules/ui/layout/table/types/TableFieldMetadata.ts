import { MessageDescriptor } from '@lingui/core';
import { IconComponent } from 'twenty-ui/display';

export type TableFieldMetadata<ItemType> = {
  fieldLabel: MessageDescriptor;
  fieldName: keyof ItemType;
  fieldType: 'string' | 'number';
  align: 'left' | 'right';
  FieldIcon?: IconComponent;
};
