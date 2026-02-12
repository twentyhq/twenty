import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';

describe('turnIntoUndefinedIfWhitespacesOnly', () => {
  it('should return undefined for whitespace-only input', () => {
    expect(turnIntoUndefinedIfWhitespacesOnly('   ')).toBeUndefined();
    expect(turnIntoUndefinedIfWhitespacesOnly('\t\n ')).toBeUndefined();
    expect(turnIntoUndefinedIfWhitespacesOnly(' \n\r\t')).toBeUndefined();
  });

  it('should return the original string for non-whitespace input', () => {
    expect(turnIntoUndefinedIfWhitespacesOnly('hello')).toBe('hello');
    expect(turnIntoUndefinedIfWhitespacesOnly('  hello  ')).toBe('  hello  ');
    expect(turnIntoUndefinedIfWhitespacesOnly('123')).toBe('123');
  });

  it('should handle empty string input', () => {
    expect(turnIntoUndefinedIfWhitespacesOnly('')).toBeUndefined();
  });
});
