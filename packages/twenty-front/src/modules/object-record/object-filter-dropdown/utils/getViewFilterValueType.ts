import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { ViewFilterValueType } from '@/views/types/ViewFilterValueType';

export const getViewFilterValueType = (
  filterDefinition: Pick<FilterDefinition, 'type'>,
  operand: ViewFilterOperand,
) => {
  switch (filterDefinition.type) {
    case 'DATE':
    case 'DATE_TIME':
      switch (operand) {
        case ViewFilterOperand.IsRelative:
          return ViewFilterValueType.VARIABLE;
        default:
          return ViewFilterValueType.STATIC;
      }
    default:
      return ViewFilterValueType.STATIC;
  }
};
