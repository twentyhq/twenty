import { assertNotNull } from '~/utils/assert';

describe('assert', () => {
  it('should return true for a NonNullable value', () => {
    expect(assertNotNull(1)).toBeTruthy();
  });

  it('should return true for a NonNullable value', () => {
    expect(assertNotNull('')).toBeTruthy();
  });

  it('should return false for a null value', () => {
    expect(assertNotNull(null)).toBeFalsy();
  });

  it('should return false for an undefined value', () => {
    expect(assertNotNull(undefined)).toBeFalsy();
  });
});
