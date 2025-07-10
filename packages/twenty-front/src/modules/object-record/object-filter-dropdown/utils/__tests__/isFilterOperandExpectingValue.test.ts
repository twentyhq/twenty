import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

import { isFilterOperandExpectingValue } from '../isFilterOperandExpectingValue';

describe('isFilterOperandExpectingValue', () => {
  const testCases = [
    { operand: ViewFilterOperand.Contains, expectedResult: true },
    { operand: ViewFilterOperand.DoesNotContain, expectedResult: true },
    { operand: ViewFilterOperand.GreaterThanOrEqual, expectedResult: true },
    { operand: ViewFilterOperand.LessThanOrEqual, expectedResult: true },
    { operand: ViewFilterOperand.Is, expectedResult: true },
    { operand: ViewFilterOperand.IsNot, expectedResult: true },
    { operand: ViewFilterOperand.IsRelative, expectedResult: true },
    { operand: ViewFilterOperand.IsBefore, expectedResult: true },
    { operand: ViewFilterOperand.IsAfter, expectedResult: true },

    { operand: ViewFilterOperand.IsNotNull, expectedResult: false },
    { operand: ViewFilterOperand.IsEmpty, expectedResult: false },
    { operand: ViewFilterOperand.IsNotEmpty, expectedResult: false },
    { operand: ViewFilterOperand.IsInPast, expectedResult: false },
    { operand: ViewFilterOperand.IsInFuture, expectedResult: false },
    { operand: ViewFilterOperand.IsToday, expectedResult: false },
  ];

  testCases.forEach(({ operand, expectedResult }) => {
    it(`should return ${expectedResult} for ViewFilterOperand.${operand}`, () => {
      expect(isFilterOperandExpectingValue(operand)).toBe(expectedResult);
    });
  });
});
