import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

import { capitalize } from 'twenty-shared/utils';
import { getOperandLabel, getOperandLabelShort } from '../getOperandLabel';

describe('getOperandLabel', () => {
  const testCases = [
    [ViewFilterOperand.Contains, 'Contains'],
    [ViewFilterOperand.DoesNotContain, "Doesn't contain"],
    [ViewFilterOperand.GreaterThanOrEqual, 'Greater than or equal'],
    [ViewFilterOperand.LessThanOrEqual, 'Less than or equal'],
    [ViewFilterOperand.Is, 'Is'],
    [ViewFilterOperand.IsNot, 'Is not'],
    [ViewFilterOperand.IsNotNull, 'Is not null'],
    [undefined, ''], // undefined operand
  ];

  testCases.forEach(([operand, expectedLabel]) => {
    const formattedOperand = capitalize(operand || 'undefined');

    it(`should return correct label for ViewFilterOperand.${formattedOperand}`, () => {
      const result = getOperandLabel(operand as ViewFilterOperand);
      expect(result).toBe(expectedLabel);
    });
  });
});

describe('getOperandLabelShort', () => {
  const testCases = [
    [ViewFilterOperand.Is, ': '],
    [ViewFilterOperand.Contains, ': '],
    [ViewFilterOperand.IsNot, ': Not'],
    [ViewFilterOperand.DoesNotContain, ': Not'],
    [ViewFilterOperand.IsNotNull, ': NotNull'],
    [ViewFilterOperand.GreaterThanOrEqual, '\u00A0≥ '],
    [ViewFilterOperand.LessThanOrEqual, '\u00A0≤ '],
    [undefined, ': '], // undefined operand
  ];

  testCases.forEach(([operand, expectedLabel]) => {
    const formattedOperand = capitalize(operand || 'undefined');

    it(`should return correct short label for ViewFilterOperand.${formattedOperand}`, () => {
      const result = getOperandLabelShort(operand as ViewFilterOperand);
      expect(result).toBe(expectedLabel);
    });
  });
});
