import { IconComponent } from '@/ui/icon/types/IconComponent';

import { SortDirection } from './SortDirection';

export type SortDefinition = {
  key: string;
  label: string;
  Icon?: IconComponent;
  getOrderByTemplate?: (direction: SortDirection) => any[];
};
