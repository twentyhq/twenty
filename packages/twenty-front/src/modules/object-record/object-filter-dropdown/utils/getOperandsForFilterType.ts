import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { isActorSourceCompositeFilter } from '@/object-record/object-filter-dropdown/utils/isActorSourceCompositeFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const getOperandsForFilterDefinition = (
  filterDefinition: Pick<FilterDefinition, 'type' | 'compositeFieldName'>,
): ViewFilterOperand[] => {
  const emptyOperands = [
    ViewFilterOperand.IsEmpty,
    ViewFilterOperand.IsNotEmpty,
  ];

  const relationOperands = [ViewFilterOperand.Is, ViewFilterOperand.IsNot];

  switch (filterDefinition.type) {
    case 'TEXT':
    case 'EMAILS':
    case 'FULL_NAME':
    case 'ADDRESS':
    case 'LINKS':
    case 'PHONES':
      return [
        ViewFilterOperand.Contains,
        ViewFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'CURRENCY':
    case 'NUMBER':
      return [
        ViewFilterOperand.GreaterThan,
        ViewFilterOperand.LessThan,
        ...emptyOperands,
      ];
    case 'RAW_JSON':
      return [
        ViewFilterOperand.Contains,
        ViewFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'DATE_TIME':
    case 'DATE':
      return [
        ViewFilterOperand.Is,
        ViewFilterOperand.IsRelative,
        ViewFilterOperand.IsInPast,
        ViewFilterOperand.IsInFuture,
        ViewFilterOperand.IsToday,
        ViewFilterOperand.IsBefore,
        ViewFilterOperand.IsAfter,
        ...emptyOperands,
      ];
    case 'RATING':
      return [
        ViewFilterOperand.Is,
        ViewFilterOperand.GreaterThan,
        ViewFilterOperand.LessThan,
        ...emptyOperands,
      ];
    case 'RELATION':
      return [...relationOperands, ...emptyOperands];
    case 'MULTI_SELECT':
      return [
        ViewFilterOperand.Contains,
        ViewFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'SELECT':
      return [ViewFilterOperand.Is, ViewFilterOperand.IsNot, ...emptyOperands];
    case 'ACTOR': {
      if (isActorSourceCompositeFilter(filterDefinition)) {
        return [
          ViewFilterOperand.Is,
          ViewFilterOperand.IsNot,
          ...emptyOperands,
        ];
      }

      return [
        ViewFilterOperand.Contains,
        ViewFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    }
    case 'ARRAY':
      return [
        ViewFilterOperand.Contains,
        ViewFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'BOOLEAN':
      return [ViewFilterOperand.Is];
    default:
      return [];
  }
};
