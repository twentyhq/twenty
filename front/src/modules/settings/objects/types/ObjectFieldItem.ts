import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export type ObjectFieldItem = {
  name: string;
  Icon: IconComponent;
  type: 'standard' | 'custom';
  dataType: 'boolean' | 'number' | 'relation' | 'social' | 'teammate' | 'text';
};
