import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';

describe('formatSearchTerms', () => {
  it('should format simple search terms with and', () => {
    expect(formatSearchTerms('my search input', 'and')).toBe(
      'my:* & search:* & input:*',
    );
  });

  it('should format simple search terms with or', () => {
    expect(formatSearchTerms('my search input', 'or')).toBe(
      'my:* | search:* | input:*',
    );
  });

  it('should return empty string for blank input', () => {
    expect(formatSearchTerms('', 'and')).toBe('');
    expect(formatSearchTerms('   ', 'and')).toBe('');
  });

  it('should split hyphenated words while preserving original term', () => {
    expect(formatSearchTerms('jean-pierre', 'and')).toBe(
      '(jean-pierre:* | jean:* & pierre:*)',
    );
  });

  it('should split hyphenated words with or operator', () => {
    expect(formatSearchTerms('jean-pierre', 'or')).toBe(
      '(jean-pierre:* | jean:* | pierre:*)',
    );
  });

  it('should handle underscores as separators', () => {
    expect(formatSearchTerms('my_company', 'and')).toBe(
      '(my_company:* | my:* & company:*)',
    );
  });

  it('should handle dots as separators', () => {
    expect(formatSearchTerms('acme.corp', 'and')).toBe(
      '(acme.corp:* | acme:* & corp:*)',
    );
  });

  it('should handle slashes as separators', () => {
    expect(formatSearchTerms('sales/marketing', 'and')).toBe(
      '(sales/marketing:* | sales:* & marketing:*)',
    );
  });

  it('should handle multi-part hyphenated words', () => {
    expect(formatSearchTerms('word-word-word', 'and')).toBe(
      '(word-word-word:* | word:* & word:* & word:*)',
    );
  });

  it('should handle mix of plain and hyphenated words', () => {
    expect(formatSearchTerms('jean-pierre martin', 'and')).toBe(
      '(jean-pierre:* | jean:* & pierre:*) & martin:*',
    );
  });

  it('should escape tsquery special characters', () => {
    expect(formatSearchTerms("o'brien", 'and')).toBe("o\\'brien:*");
  });
});
