import { describe, expect, it } from 'vitest';

import { salaryTransform } from 'src/logic-functions/utils/salary-transform';

describe('salaryTransform', () => {
  it('maps PDL salary ranges to option values', () => {
    expect(salaryTransform('<20,000')).toBe('UNDER_20000');
    expect(salaryTransform('45,000-55,000')).toBe('FROM_45000_TO_55000');
    expect(salaryTransform('>250,000')).toBe('OVER_250000');
  });

  it('returns undefined for an unknown range', () => {
    expect(salaryTransform('weird')).toBeUndefined();
  });
});
