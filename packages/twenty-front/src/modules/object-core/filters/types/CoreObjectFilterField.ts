import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

export type CoreObjectFilterFieldType =
  | 'TEXT'
  | 'MULTI_SELECT'
  | 'DATE_TIME'
  | 'BOOLEAN';

export type CoreObjectFilterFieldOption = {
  value: string;
  label: MessageDescriptor;
  color: ThemeColor;
};

export type CoreObjectFilterField<TFieldKey extends string = string> = {
  key: TFieldKey;
  label: MessageDescriptor;
  filterType: CoreObjectFilterFieldType;
  Icon: IconComponent;
  options?: CoreObjectFilterFieldOption[];
};
