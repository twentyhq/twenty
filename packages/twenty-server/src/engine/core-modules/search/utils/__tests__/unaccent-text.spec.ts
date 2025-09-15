import { unaccentText } from 'src/engine/core-modules/search/utils/unaccent-text';

describe('unaccentText', () => {
  it('should remove common diacritical marks', () => {
    expect(unaccentText('café')).toBe('cafe');
    expect(unaccentText('résumé')).toBe('resume');
    expect(unaccentText('naïve')).toBe('naive');
    expect(unaccentText('José')).toBe('Jose');
    expect(unaccentText('François')).toBe('Francois');
    expect(unaccentText('Müller')).toBe('Muller');
    expect(unaccentText('Åsa')).toBe('Asa');
    expect(unaccentText('Björk')).toBe('Bjork');
    expect(unaccentText('Zürich')).toBe('Zurich');
    expect(unaccentText('piñata')).toBe('pinata');
  });

  it('should handle mixed accented and non-accented text', () => {
    expect(unaccentText('José García works at Café')).toBe(
      'Jose Garcia works at Cafe',
    );
    expect(unaccentText('François & Müller Company')).toBe(
      'Francois & Muller Company',
    );
    expect(unaccentText('123 Zürich Street, naïve café')).toBe(
      '123 Zurich Street, naive cafe',
    );
  });

  it('should preserve non-accented text unchanged', () => {
    expect(unaccentText('Hello World')).toBe('Hello World');
    expect(unaccentText('Company Inc.')).toBe('Company Inc.');
    expect(unaccentText('123 Main Street')).toBe('123 Main Street');
    expect(unaccentText('user@example.com')).toBe('user@example.com');
  });

  it('should handle edge cases', () => {
    expect(unaccentText('')).toBe('');
    expect(unaccentText('   ')).toBe('   ');
    expect(unaccentText('123')).toBe('123');
    expect(unaccentText('!@#$%^&*()')).toBe('!@#$%^&*()');
  });

  it('should handle null and undefined values gracefully', () => {
    expect(unaccentText(null as any)).toBe(null);
    expect(unaccentText(undefined as any)).toBe(undefined);
  });

  it('should handle complex Unicode normalization', () => {
    expect(unaccentText('é')).toBe('e');
    expect(unaccentText('e\u0301')).toBe('e');
    expect(unaccentText('ñ')).toBe('n');
    expect(unaccentText('ø')).toBe('o');
    expect(unaccentText('ç')).toBe('c');
  });
});
