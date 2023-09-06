import { IconComponent } from '@/ui/icon/types/IconComponent';
import { SortOrder as Order_By } from '~/generated/graphql';

export type SortType<OrderByTemplate> = {
  label: string;
  key: string;
  Icon?: IconComponent;
  orderByTemplate?: (order: Order_By) => OrderByTemplate[];
};

export type SelectedSortType<OrderByTemplate> = SortType<OrderByTemplate> & {
  order: 'asc' | 'desc';
};
