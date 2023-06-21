import { SortOrder as Order_By } from '~/generated/graphql';

import {
  FilterWhereType,
  SelectedFilterType,
} from './interfaces/filters/interface';
import { SelectedSortType } from './interfaces/sorts/interface';

export const reduceFiltersToWhere = <WhereTemplateType extends FilterWhereType>(
  filters: Array<SelectedFilterType<WhereTemplateType>>,
): Record<string, any> => {
  const where = filters.reduce((acc, filter) => {
    return { ...acc, ...filter.operand.whereTemplate(filter.value) };
  }, {} as Record<string, any>);
  return where;
};

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
    if (sort._type === 'custom_sort') {
      return sort.orderByTemplates.map((orderByTemplate) =>
        orderByTemplate(mapOrderToOrder_By(sort.order)),
      );
    }

    return defaultOrderByTemplateFactory(sort.key as string)(sort.order);
  });
  return mappedSorts.flat() as OrderByTemplate[];
};
