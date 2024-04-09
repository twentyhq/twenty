import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { getOperandsForFilterType } from '../getOperandsForFilterType';

describe('getOperandsForFilterType', () => {
  const testCases = [
    ['TEXT', [ViewFilterOperand.Contains, ViewFilterOperand.DoesNotContain]],
    ['EMAIL', [ViewFilterOperand.Contains, ViewFilterOperand.DoesNotContain]],
    [
      'FULL_NAME',
      [ViewFilterOperand.Contains, ViewFilterOperand.DoesNotContain],
    ],
    ['ADDRESS', [ViewFilterOperand.Contains, ViewFilterOperand.DoesNotContain]],
    ['LINK', [ViewFilterOperand.Contains, ViewFilterOperand.DoesNotContain]],
    ['CURRENCY', [ViewFilterOperand.GreaterThan, ViewFilterOperand.LessThan]],
    ['NUMBER', [ViewFilterOperand.GreaterThan, ViewFilterOperand.LessThan]],
    ['DATE_TIME', [ViewFilterOperand.GreaterThan, ViewFilterOperand.LessThan]],
    ['RELATION', [ViewFilterOperand.Is, ViewFilterOperand.IsNot]],
    [undefined, []],
    [null, []],
    ['UNKNOWN_TYPE', []],
  ];

  testCases.forEach(([filterType, expectedOperands]) => {
    it(`should return correct operands for FilterType.${filterType}`, () => {
      const result = getOperandsForFilterType(filterType as FilterType);
      expect(result).toEqual(expectedOperands);
    });
  });
});
