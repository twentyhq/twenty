import { ViewFilterOperand } from 'twenty-shared/types';

import { capitalize } from 'twenty-shared/utils';
import {
  getOperandLabel,
  getOperandLabelShort,
} from '@/object-record/object-filter-dropdown/utils/getOperandLabel';

describe('getOperandLabel', () => {
  const testCases = [
    [ViewFilterOperand.CONTAINS, 'Contains'],
    [ViewFilterOperand.DOES_NOT_CONTAIN, "Doesn't contain"],
    [ViewFilterOperand.GREATER_THAN_OR_EQUAL, 'Greater than or equal'],
    [ViewFilterOperand.LESS_THAN_OR_EQUAL, 'Less than or equal'],
    [ViewFilterOperand.IS, 'Is'],
    [ViewFilterOperand.IS_NOT, 'Is not'],
    [ViewFilterOperand.IS_NOT_NULL, 'Is not null'],
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
    [ViewFilterOperand.IS, ': '],
    [ViewFilterOperand.CONTAINS, ': '],
    [ViewFilterOperand.IS_NOT, ': Not'],
    [ViewFilterOperand.DOES_NOT_CONTAIN, ': Not'],
    [ViewFilterOperand.IS_NOT_NULL, ': NotNull'],
    [ViewFilterOperand.GREATER_THAN_OR_EQUAL, '\u00A0≥ '],
    [ViewFilterOperand.LESS_THAN_OR_EQUAL, '\u00A0≤ '],
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
