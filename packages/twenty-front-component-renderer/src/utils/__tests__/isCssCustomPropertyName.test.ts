import { isCssCustomPropertyName } from '../isCssCustomPropertyName';

describe('isCssCustomPropertyName', () => {
  it('should detect a custom property name', () => {
    expect(isCssCustomPropertyName('--gap')).toBe(true);
  });

  it('should reject a standard property name', () => {
    expect(isCssCustomPropertyName('color')).toBe(false);
  });
});
