import { ViewFilterOperand } from 'twenty-shared/types';

import { isFilterOperandExpectingValue } from '@/object-record/object-filter-dropdown/utils/isFilterOperandExpectingValue';

describe('isFilterOperandExpectingValue', () => {
  const testCases = [
    { operand: ViewFilterOperand.CONTAINS, expectedResult: true },
    { operand: ViewFilterOperand.DOES_NOT_CONTAIN, expectedResult: true },
    { operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL, expectedResult: true },
    { operand: ViewFilterOperand.LESS_THAN_OR_EQUAL, expectedResult: true },
    { operand: ViewFilterOperand.IS, expectedResult: true },
    { operand: ViewFilterOperand.IS_NOT, expectedResult: true },
    { operand: ViewFilterOperand.IS_RELATIVE, expectedResult: true },
    { operand: ViewFilterOperand.IS_BEFORE, expectedResult: true },
    { operand: ViewFilterOperand.IS_AFTER, expectedResult: true },

    { operand: ViewFilterOperand.IS_NOT_NULL, expectedResult: false },
    { operand: ViewFilterOperand.IS_EMPTY, expectedResult: false },
    { operand: ViewFilterOperand.IS_NOT_EMPTY, expectedResult: false },
    { operand: ViewFilterOperand.IS_IN_PAST, expectedResult: false },
    { operand: ViewFilterOperand.IS_IN_FUTURE, expectedResult: false },
    { operand: ViewFilterOperand.IS_TODAY, expectedResult: false },
  ];

  testCases.forEach(({ operand, expectedResult }) => {
    it(`should return ${expectedResult} for ViewFilterOperand.${operand}`, () => {
      expect(isFilterOperandExpectingValue(operand)).toBe(expectedResult);
    });
  });
});
