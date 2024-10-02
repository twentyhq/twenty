import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { FilterType } from '../types/FilterType';

export const getOperandsForFilterType = (
  filterType: FilterType | null | undefined,
): ViewFilterOperand[] => {
  const emptyOperands = [
    ViewFilterOperand.IsEmpty,
    ViewFilterOperand.IsNotEmpty,
  ];

  const relationOperands = [ViewFilterOperand.Is, ViewFilterOperand.IsNot];

  switch (filterType) {
    case 'TEXT':
    case 'EMAIL':
    case 'EMAILS':
    case 'FULL_NAME':
    case 'ADDRESS':
    case 'PHONE':
    case 'LINK':
    case 'LINKS':
    case 'ACTOR':
    case 'ARRAY':
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
    case 'SOURCE':
      return [...relationOperands];
    case 'SELECT':
      return [...relationOperands];
    default:
      return [];
  }
};
