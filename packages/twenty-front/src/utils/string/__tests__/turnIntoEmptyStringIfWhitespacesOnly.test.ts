import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

describe('turnIntoEmptyStringIfWhitespacesOnly', () => {
  it('should return an empty string for whitespace-only input', () => {
    expect(turnIntoEmptyStringIfWhitespacesOnly('   ')).toBe('');
    expect(turnIntoEmptyStringIfWhitespacesOnly('\t\n ')).toBe('');
    expect(turnIntoEmptyStringIfWhitespacesOnly(' \n\r\t')).toBe('');
  });

  it('should return the original string for non-whitespace input', () => {
    expect(turnIntoEmptyStringIfWhitespacesOnly('hello')).toBe('hello');
    expect(turnIntoEmptyStringIfWhitespacesOnly('  hello  ')).toBe('  hello  ');
    expect(turnIntoEmptyStringIfWhitespacesOnly('123')).toBe('123');
  });

  it('should handle empty string input', () => {
    expect(turnIntoEmptyStringIfWhitespacesOnly('')).toBe('');
  });
});
