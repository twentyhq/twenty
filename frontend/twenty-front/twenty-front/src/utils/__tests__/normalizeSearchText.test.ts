import { normalizeSearchText } from '~/utils/normalizeSearchText';

describe('normalizeSearchText', () => {
  it('should handle basic ASCII text', () => {
    expect(normalizeSearchText('Hello World')).toBe('hello world');
    expect(normalizeSearchText('TEST')).toBe('test');
    expect(normalizeSearchText('MixedCase123')).toBe('mixedcase123');
  });

  it('should remove accents from various languages', () => {
    expect(normalizeSearchText('café')).toBe('cafe');
    expect(normalizeSearchText('naïve')).toBe('naive');
    expect(normalizeSearchText('résumé')).toBe('resume');
    expect(normalizeSearchText('Zürich')).toBe('zurich');
    expect(normalizeSearchText('Müller')).toBe('muller');
    expect(normalizeSearchText('niño')).toBe('nino');
    expect(normalizeSearchText('España')).toBe('espana');
    expect(normalizeSearchText('São Paulo')).toBe('sao paulo');
    expect(normalizeSearchText('João')).toBe('joao');
    expect(normalizeSearchText('Åse')).toBe('ase');
    expect(normalizeSearchText('Øyvind')).toBe('oyvind');
  });

  it('should handle Nordic and Germanic special characters', () => {
    expect(normalizeSearchText('Øyvind')).toBe('oyvind');
    expect(normalizeSearchText('Åse')).toBe('ase');
    expect(normalizeSearchText('Æther')).toBe('aether');
    expect(normalizeSearchText('Straße')).toBe('strasse');
    expect(normalizeSearchText('Łódź')).toBe('lodz');
    expect(normalizeSearchText('Œuvre')).toBe('oeuvre');
  });

  it('should handle mixed case with accents', () => {
    expect(normalizeSearchText('CAFÉ')).toBe('cafe');
    expect(normalizeSearchText('NaÏvE')).toBe('naive');
    expect(normalizeSearchText('ZÜRICH')).toBe('zurich');
  });

  it('should handle null and undefined gracefully', () => {
    expect(normalizeSearchText(null)).toBe('');
    expect(normalizeSearchText(undefined)).toBe('');
  });

  it('should handle empty strings', () => {
    expect(normalizeSearchText('')).toBe('');
    expect(normalizeSearchText('   ')).toBe('   ');
  });

  it('should handle special characters and numbers', () => {
    expect(normalizeSearchText('user@example.com')).toBe('user@example.com');
    expect(normalizeSearchText('123-456-7890')).toBe('123-456-7890');
    expect(normalizeSearchText('Café #1')).toBe('cafe #1');
  });

  it('should handle complex Unicode combinations', () => {
    expect(normalizeSearchText('e\u0301')).toBe('e');
    expect(normalizeSearchText('a\u0300\u0301')).toBe('a');
    expect(normalizeSearchText('é')).toBe('e');
    expect(normalizeSearchText('e\u0301')).toBe('e');
  });

  it('should be consistent for search matching', () => {
    const searchTerm = 'cafe';
    const names = ['Café', 'CAFE', 'cafe', 'Cafe'];

    names.forEach((name) => {
      expect(normalizeSearchText(name)).toContain(searchTerm);
    });
  });
});
