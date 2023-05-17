import { ReactNode } from 'react';
import { Order_By } from '../../generated/graphql';

export type SortType<OrderByTemplate> =
  | {
      _type: 'default_sort';
      label: string;
      key: keyof OrderByTemplate & string;
      icon?: ReactNode;
    }
  | {
      _type: 'custom_sort';
      label: string;
      key: string;
      icon?: ReactNode;
      orderByTemplate: (order: Order_By) => OrderByTemplate;
    };

export type SelectedSortType<OrderByTemplate> = SortType<OrderByTemplate> & {
  order: 'asc' | 'desc';
};
