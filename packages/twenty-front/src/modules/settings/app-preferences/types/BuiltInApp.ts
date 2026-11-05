import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

export type BuiltInApp = {
  id: string;
  name: MessageDescriptor;
  description: MessageDescriptor;
  logo: string;
  Icon: IconComponent;
};
