import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { ObjectFieldDataType } from './ObjectFieldDataType';

export type ObjectFieldItem = {
  name: string;
  Icon: IconComponent;
  type: 'standard' | 'custom';
  dataType: ObjectFieldDataType;
};
