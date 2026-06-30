import { validateAllowedValue } from 'src/engine/core-modules/sql-sanitization/utils/validate-allowed-value.util';

describe('validateAllowedValue', () => {
  const allowedFruits = ['apple', 'banana', 'cherry'] as const;

  it('should accept allowed values', () => {
    expect(() =>
      validateAllowedValue('apple', allowedFruits, 'fruit'),
    ).not.toThrow();
    expect(() =>
      validateAllowedValue('banana', allowedFruits, 'fruit'),
    ).not.toThrow();
  });

  it('should reject disallowed values', () => {
    expect(() => validateAllowedValue('mango', allowedFruits, 'fruit')).toThrow(
      'Invalid fruit: mango',
    );
  });

  it('should reject empty string when not in allowed list', () => {
    expect(() => validateAllowedValue('', allowedFruits, 'fruit')).toThrow();
  });

  it('should be case-sensitive', () => {
    expect(() =>
      validateAllowedValue('Apple', allowedFruits, 'fruit'),
    ).toThrow();
  });
});
