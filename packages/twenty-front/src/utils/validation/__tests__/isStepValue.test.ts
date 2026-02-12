import { isStepValue } from '~/utils/validation/isStepValue';

describe('isStepValue', () => {
  it('should detect step values', () => {
    expect(isStepValue('*/5')).toBe(true);
    expect(isStepValue('1-10/2')).toBe(true);
    expect(isStepValue('0-59/15')).toBe(true);
  });

  it('should reject non-step values', () => {
    expect(isStepValue('*')).toBe(false);
    expect(isStepValue('1-5')).toBe(false);
    expect(isStepValue('1,2,3')).toBe(false);
    expect(isStepValue('15')).toBe(false);
  });
});
