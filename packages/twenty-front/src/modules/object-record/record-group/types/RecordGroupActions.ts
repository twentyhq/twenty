import { MessageDescriptor } from '@lingui/core';
import { IconComponent } from 'twenty-ui/display';

export type RecordGroupAction = {
  id: string;
  label: MessageDescriptor | string;
  icon: IconComponent;
  position: number;
  callback: () => void;
  condition?: boolean;
};
