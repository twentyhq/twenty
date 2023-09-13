import { SortOrder as Order_By } from '~/generated/graphql';

import { SelectedSortType } from '../types/interface';

export const reduceSortsToOrderBy = <OrderByTemplate>(
  sorts: SelectedSortType<OrderByTemplate>[],
): OrderByTemplate[] =>
  sorts
    .map((sort) => {
      const order = sort.order === 'asc' ? Order_By.Asc : Order_By.Desc;
      return (
        sort.orderByTemplate?.(order) || [
          { [sort.key]: order } as OrderByTemplate,
        ]
      );
    })
    .flat();
