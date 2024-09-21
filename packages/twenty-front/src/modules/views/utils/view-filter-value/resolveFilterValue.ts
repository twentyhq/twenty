import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { resolveNumberViewFilterValue } from '@/views/utils/view-filter-value/resolveNumberViewFilterValue';
import { resolveDateViewFilterValue } from './resolveDateViewFilterValue';

type ResolvedFilterValue<T extends FilterType> = T extends 'DATE' | 'DATE_TIME'
  ? ReturnType<typeof resolveDateViewFilterValue>
  : T extends 'NUMBER'
    ? ReturnType<typeof resolveNumberViewFilterValue>
    : string;

export const resolveFilterValue = <T extends FilterType>(
  filter: Pick<Filter, 'value' | 'valueType'> & { definition: { type: T } },
) => {
  switch (filter.definition.type) {
    case 'DATE':
    case 'DATE_TIME':
      return resolveDateViewFilterValue(filter) as ResolvedFilterValue<T>;
    case 'NUMBER':
      return resolveNumberViewFilterValue(filter) as ResolvedFilterValue<T>;
    default:
      return filter.value as ResolvedFilterValue<T>;
  }
};
