import { FilterBase } from '@/views/filter-transforms/types/FilterBase';
import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';

type VariableDateFilter = FilterBase<
  'DATE',
  {
    direction: VariableDateViewFilterValueDirection;
    amount?: number;
    unit: VariableDateViewFilterValueUnit;
  }
>;

type VariableRelationFilter = FilterBase<'RELATION', string[]>;

export type VariableFilter = VariableDateFilter | VariableRelationFilter;
