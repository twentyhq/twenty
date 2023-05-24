import { SortOrder as Order_By } from '../../../generated/graphql';
import { BoolExpType } from '../../../interfaces/entities/generic.interface';
import {
  FilterableFieldsType,
  FilterWhereType,
  SelectedFilterType,
} from '../../../interfaces/filters/interface';
import { SelectedSortType } from '../../../interfaces/sorts/interface';

export const reduceFiltersToWhere = <
  ValueType extends FilterableFieldsType,
  WhereTemplateType extends FilterWhereType,
>(
  filters: Array<SelectedFilterType<ValueType, WhereTemplateType>>,
): BoolExpType<WhereTemplateType> => {
  const where = filters.reduce((acc, filter) => {
    return { ...acc, ...filter.operand.whereTemplate(filter.value) };
  }, {} as BoolExpType<WhereTemplateType>);
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
