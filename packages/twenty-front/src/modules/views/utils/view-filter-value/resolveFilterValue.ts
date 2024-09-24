import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { ViewFilterValueType } from '@/views/types/ViewFilterValueType';
import { resolveNumberViewFilterValue } from '@/views/utils/view-filter-value/resolveNumberViewFilterValue';
import {
  resolveDateViewFilterValue,
  ResolvedDateViewFilterValue,
} from './resolveDateViewFilterValue';

type ResolvedFilterValue<
  F extends FilterType,
  V extends ViewFilterValueType,
> = F extends 'DATE' | 'DATE_TIME'
  ? ResolvedDateViewFilterValue<V>
  : F extends 'NUMBER'
    ? ReturnType<typeof resolveNumberViewFilterValue>
    : string;

type PartialFilter<F extends FilterType, V extends ViewFilterValueType> = Pick<
  Filter,
  'value'
> & {
  definition: { type: F };
  valueType: V;
};

export const resolveFilterValue = <
  F extends FilterType,
  V extends ViewFilterValueType,
>(
  filter: PartialFilter<F, V>,
) => {
  switch (filter.definition.type) {
    case 'DATE':
    case 'DATE_TIME':
      return resolveDateViewFilterValue(filter) as ResolvedFilterValue<F, V>;
    case 'NUMBER':
      return resolveNumberViewFilterValue(filter) as ResolvedFilterValue<F, V>;
    default:
      return filter.value as ResolvedFilterValue<F, V>;
  }
};
