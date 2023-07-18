import { SortOrder as Order_By } from '~/generated/graphql';

import { SelectedSortType } from './types/interface';

const mapOrderToOrder_By = (order: string) => {
  if (order === 'asc') return Order_By.Asc;
  return Order_By.Desc;
};

export const defaultOrderByTemplateFactory =
  (key: string) => (order: string) => ({
    [key]: order,
  });

export const reduceSortsToOrderBy = <OrderByTemplate>(
  sorts: Array<SelectedSortType<OrderByTemplate>>,
): OrderByTemplate[] => {
  const mappedSorts = sorts.map((sort) => {
    if (sort.orderByTemplates) {
      return sort.orderByTemplates?.map((orderByTemplate) =>
        orderByTemplate(mapOrderToOrder_By(sort.order)),
      );
    }

    return defaultOrderByTemplateFactory(sort.key as string)(sort.order);
  });
  return mappedSorts.flat() as OrderByTemplate[];
};
