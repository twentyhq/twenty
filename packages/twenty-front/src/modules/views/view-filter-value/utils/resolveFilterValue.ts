import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { resolveNumberViewFilterValue } from '@/views/view-filter-value/utils/resolveNumberViewFilterValue';
import { resolveSelectViewFilterValue } from '@/views/view-filter-value/utils/resolveSelectViewFilterValue';
import {
  resolveDateViewFilterValue,
  ResolvedDateViewFilterValue,
} from './resolveDateViewFilterValue';
import { resolveBooleanViewFilterValue } from '@/views/view-filter-value/utils/resolveBooleanViewFilterValue';

type ResolvedFilterValue<
  T extends FilterableFieldType,
  O extends ViewFilterOperand,
> = T extends 'DATE' | 'DATE_TIME'
  ? ResolvedDateViewFilterValue<O>
  : T extends 'NUMBER'
    ? ReturnType<typeof resolveNumberViewFilterValue>
    : T extends 'SELECT' | 'MULTI_SELECT'
      ? string[]
      : T extends 'BOOLEAN'
        ? boolean
        : string;

type PartialFilter<
  T extends FilterableFieldType,
  O extends ViewFilterOperand,
> = Pick<Filter, 'value'> & {
  definition: { type: T };
  operand: O;
};

export const resolveFilterValue = <
  T extends FilterableFieldType,
  O extends ViewFilterOperand,
>(
  filter: PartialFilter<T, O>,
) => {
  switch (filter.definition.type) {
    case 'DATE':
    case 'DATE_TIME':
      return resolveDateViewFilterValue(filter) as ResolvedFilterValue<T, O>;
    case 'NUMBER':
      return resolveNumberViewFilterValue(filter) as ResolvedFilterValue<T, O>;
    case 'SELECT':
    case 'MULTI_SELECT':
      return resolveSelectViewFilterValue(filter) as ResolvedFilterValue<T, O>;
    case 'BOOLEAN':
      return resolveBooleanViewFilterValue(filter) as ResolvedFilterValue<T, O>;
    default:
      return filter.value as ResolvedFilterValue<T, O>;
  }
};
