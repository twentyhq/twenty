import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { getOperandsForFilterDefinition } from '../getOperandsForFilterType';

describe('getOperandsForFilterType', () => {
  const emptyOperands = [
    ViewFilterOperand.IsEmpty,
    ViewFilterOperand.IsNotEmpty,
  ];

  const containsOperands = [
    ViewFilterOperand.Contains,
    ViewFilterOperand.DoesNotContain,
  ];

  const numberOperands = [
    ViewFilterOperand.GreaterThan,
    ViewFilterOperand.LessThan,
  ];

  const dateOperands = [
    ViewFilterOperand.Is,
    ViewFilterOperand.IsRelative,
    ViewFilterOperand.IsInPast,
    ViewFilterOperand.IsInFuture,
    ViewFilterOperand.IsToday,
    ViewFilterOperand.IsBefore,
    ViewFilterOperand.IsAfter,
  ];

  const relationOperand = [ViewFilterOperand.Is, ViewFilterOperand.IsNot];

  const testCases = [
    ['TEXT', [...containsOperands, ...emptyOperands]],
    ['FULL_NAME', [...containsOperands, ...emptyOperands]],
    ['ADDRESS', [...containsOperands, ...emptyOperands]],
    ['LINKS', [...containsOperands, ...emptyOperands]],
    ['ACTOR', [...containsOperands, ...emptyOperands]],
    ['CURRENCY', [...numberOperands, ...emptyOperands]],
    ['NUMBER', [...numberOperands, ...emptyOperands]],
    ['DATE', [...dateOperands, ...emptyOperands]],
    ['DATE_TIME', [...dateOperands, ...emptyOperands]],
    ['RELATION', [...relationOperand, ...emptyOperands]],
    [undefined, []],
    [null, []],
    ['UNKNOWN_TYPE', []],
  ];

  testCases.forEach(([filterType, expectedOperands]) => {
    it(`should return correct operands for FilterType.${filterType}`, () => {
      const result = getOperandsForFilterDefinition({
        type: filterType as FilterableFieldType,
      } as FilterDefinition);
      expect(result).toEqual(expectedOperands);
    });
  });
});
