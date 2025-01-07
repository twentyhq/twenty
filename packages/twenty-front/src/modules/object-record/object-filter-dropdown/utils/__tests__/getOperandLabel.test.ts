import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { capitalize } from 'twenty-shared';

import { getOperandLabel, getOperandLabelShort } from '../getOperandLabel';

describe('getOperandLabel', () => {
  const testCases = [
    [ViewFilterOperand.Contains, 'Contains'],
    [ViewFilterOperand.DoesNotContain, "Doesn't contain"],
    [ViewFilterOperand.GreaterThan, 'Greater than'],
    [ViewFilterOperand.LessThan, 'Less than'],
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
    [ViewFilterOperand.GreaterThan, '\u00A0> '],
    [ViewFilterOperand.LessThan, '\u00A0< '],
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
