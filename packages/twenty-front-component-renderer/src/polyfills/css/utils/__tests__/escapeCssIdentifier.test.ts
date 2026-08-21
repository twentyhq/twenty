import { escapeCssIdentifier } from '../escapeCssIdentifier';

describe('escapeCssIdentifier', () => {
  it('should return an empty string as-is', () => {
    expect(escapeCssIdentifier('')).toBe('');
  });

  it('should replace the null character with the replacement character', () => {
    expect(escapeCssIdentifier('\0')).toBe('�');
    expect(escapeCssIdentifier('a\0b')).toBe('a�b');
  });

  it('should escape control characters as hexadecimal code points', () => {
    expect(escapeCssIdentifier('\x01\x02\x1E\x1F')).toBe('\\1 \\2 \\1e \\1f ');
    expect(escapeCssIdentifier('\x7F')).toBe('\\7f ');
  });

  it('should escape a leading digit as a hexadecimal code point', () => {
    expect(escapeCssIdentifier('0col')).toBe('\\30 col');
    expect(escapeCssIdentifier('123')).toBe('\\31 23');
  });

  it('should escape a digit following a leading hyphen', () => {
    expect(escapeCssIdentifier('-0col')).toBe('-\\30 col');
  });

  it('should escape a lone hyphen and keep hyphen prefixes intact', () => {
    expect(escapeCssIdentifier('-')).toBe('\\-');
    expect(escapeCssIdentifier('-a')).toBe('-a');
    expect(escapeCssIdentifier('--a')).toBe('--a');
  });

  it('should keep safe identifier characters and non-ascii characters as-is', () => {
    expect(escapeCssIdentifier('_a-b0')).toBe('_a-b0');
    expect(escapeCssIdentifier('éàç')).toBe('éàç');
  });

  it('should backslash-escape other printable characters', () => {
    expect(escapeCssIdentifier('.foo#bar')).toBe('\\.foo\\#bar');
    expect(escapeCssIdentifier('a b')).toBe('a\\ b');
  });

  it('should stringify non-string values before escaping', () => {
    expect(escapeCssIdentifier(1)).toBe('\\31 ');
  });
});
