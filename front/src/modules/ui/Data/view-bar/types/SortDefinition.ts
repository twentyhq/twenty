import { IconComponent } from '@/ui/Display/Icon/types/IconComponent';

import { SortDirection } from './SortDirection';

export type SortDefinition = {
  key: string;
  label: string;
  Icon?: IconComponent;
  getOrderByTemplate?: (direction: SortDirection) => any[];
};
