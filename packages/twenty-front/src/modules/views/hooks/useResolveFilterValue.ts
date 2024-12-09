import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useResolveRelationViewFilterValue } from '@/views/view-filter-value/hooks/useResolveRelationViewFilterValue';
import { resolveBooleanViewFilterValue } from '@/views/view-filter-value/utils/resolveBooleanViewFilterValue';
import { resolveNumberViewFilterValue } from '@/views/view-filter-value/utils/resolveNumberViewFilterValue';
import { resolveSelectViewFilterValue } from '@/views/view-filter-value/utils/resolveSelectViewFilterValue';
import {
  resolveDateViewFilterValue,
  ResolvedDateViewFilterValue,
} from '../view-filter-value/utils/resolveDateViewFilterValue';

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
        : T extends 'RELATION'
          ? string[]
          : string;

// TODO: Convert all resolve functions into hooks
export const useResolveFilterValue = () => {
  const { resolveRelationViewFilterValue } = useResolveRelationViewFilterValue();

  const resolveFilterValue = <
    T extends FilterableFieldType,
    O extends ViewFilterOperand,
  >(
    filterDefinitionType: T,
    viewFilterValue: string,
    viewFilterOperand: O,
  ): ResolvedFilterValue<T, O> => {
    switch (filterDefinitionType) {
      case 'DATE':
      case 'DATE_TIME':
        return resolveDateViewFilterValue<O>(
          viewFilterValue,
          viewFilterOperand,
        ) as ResolvedFilterValue<T, O>;
      /* case 'NUMBER':
        return resolveNumberViewFilterValue(viewFilterValue); */
      case 'SELECT':
      case 'MULTI_SELECT':
        return resolveSelectViewFilterValue(
          viewFilterValue,
        ) as ResolvedFilterValue<T, O>;
      case 'BOOLEAN':
        return resolveBooleanViewFilterValue(
          viewFilterValue,
        ) as ResolvedFilterValue<T, O>;
      case 'RELATION':
        return resolveRelationViewFilterValue(
          viewFilterValue
        ) as ResolvedFilterValue<T, O>;
      default:
        return viewFilterValue as ResolvedFilterValue<T, O>;
    }
  };

  return { resolveFilterValue };
};
