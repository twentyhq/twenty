import { SortOrder as Order_By } from '~/generated/graphql';

import { Sort } from '../types/Sort';

export const reduceSortsToOrderBy = (sorts: Sort[]): any[] =>
  sorts
    .map((sort) => {
      const direction = sort.direction === 'asc' ? Order_By.Asc : Order_By.Desc;

      if (sort.definition.getOrderByTemplate) {
        return sort.definition.getOrderByTemplate(direction);
      } else {
        return [{ [sort.definition.key]: direction }];
      }
    })
    .flat();
