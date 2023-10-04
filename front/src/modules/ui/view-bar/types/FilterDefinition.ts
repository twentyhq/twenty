import { IconComponent } from '@/ui/icon/types/IconComponent';

import { FilterType } from './FilterType';

export type FilterDefinition = {
  key: string;
  label: string;
  Icon: IconComponent;
  type: FilterType;
  entitySelectComponent?: JSX.Element;
  selectAllLabel?: string;
  SelectAllIcon?: IconComponent;
};
