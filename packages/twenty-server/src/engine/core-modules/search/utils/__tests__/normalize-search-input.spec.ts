import { normalizeSearchInput } from 'src/engine/core-modules/search/utils/normalize-search-input';

describe('normalizeSearchInput', () => {
  it('should strip formatting from a US-formatted phone number', () => {
    expect(normalizeSearchInput('(256) 945-6948')).toBe('2569456948');
  });

  it('should strip formatting from a phone with country code', () => {
    expect(normalizeSearchInput('+1 (256) 945-6948')).toBe('+12569456948');
  });

  it('should strip dashes from a dashed phone number', () => {
    expect(normalizeSearchInput('256-945-6948')).toBe('2569456948');
  });

  it('should strip dots from a dotted phone number', () => {
    expect(normalizeSearchInput('256.945.6948')).toBe('2569456948');
  });

  it('should strip spaces from a spaced phone number', () => {
    expect(normalizeSearchInput('256 945 6948')).toBe('2569456948');
  });

  it('should not modify an already clean phone number', () => {
    expect(normalizeSearchInput('+12569456948')).toBe('+12569456948');
  });

  it('should not modify regular text search', () => {
    expect(normalizeSearchInput('john doe')).toBe('john doe');
  });

  it('should not modify email search', () => {
    expect(normalizeSearchInput('john@example.com')).toBe('john@example.com');
  });

  it('should not modify mixed alphanumeric search', () => {
    expect(normalizeSearchInput('123 Main St')).toBe('123 Main St');
  });

  it('should return empty string for empty input', () => {
    expect(normalizeSearchInput('')).toBe('');
    expect(normalizeSearchInput('   ')).toBe('');
  });

  it('should not normalize very short digit sequences', () => {
    expect(normalizeSearchInput('(12)')).toBe('(12)');
  });

  it('should normalize a short area code', () => {
    expect(normalizeSearchInput('(256)')).toBe('256');
  });
});
