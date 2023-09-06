import { ReactNode } from 'react';

import { SortOrder as Order_By } from '~/generated/graphql';

export type SortType<OrderByTemplate> = {
  label: string;
  key: string;
  icon?: ReactNode;
  orderByTemplate?: (order: Order_By) => OrderByTemplate[];
};

export type SelectedSortType<OrderByTemplate> = SortType<OrderByTemplate> & {
  order: 'asc' | 'desc';
};
