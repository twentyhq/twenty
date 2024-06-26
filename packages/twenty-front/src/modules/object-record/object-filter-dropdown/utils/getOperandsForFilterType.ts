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
    case 'FULL_NAME':
    case 'ADDRESS':
    case 'PHONE':
    case 'LINK':
    case 'LINKS':
      return [
        ViewFilterOperand.Contains,
        ViewFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'CURRENCY':
    case 'NUMBER':
    case 'DATE_TIME':
    case 'DATE':
      return [
        ViewFilterOperand.GreaterThan,
        ViewFilterOperand.LessThan,
        ...emptyOperands,
      ];
    case 'RELATION':
      return [...relationOperands, ...emptyOperands];
    case 'SELECT':
      return [...relationOperands];
    default:
      return [];
  }
};
