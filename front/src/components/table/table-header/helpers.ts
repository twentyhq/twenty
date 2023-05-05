import { Order_By } from '../../../generated/graphql';
import { SelectedFilterType, SelectedSortType } from './interface';

export const reduceFiltersToWhere = <T>(
  filters: Array<SelectedFilterType<T>>,
): T => {
  const where = filters.reduce((acc, filter) => {
    const { where } = filter;
    return { ...acc, ...where };
  }, {} as T);
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
    if (sort._type === 'custom_sort')
      return sort.orderByTemplate(mapOrderToOrder_By(sort.order));
    return defaultOrderByTemplateFactory(sort.key as string)(sort.order);
  });
  return mappedSorts as OrderByTemplate[];
};
