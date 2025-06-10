import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';

describe('formatSearchTerms', () => {
  it('should format the search terms', () => {
    const formattedTerms = formatSearchTerms('my search input', 'and');

    expect(formattedTerms).toBe('my:* & search:* & input:*');
  });

  it('should format the search terms with or', () => {
    const formattedTerms = formatSearchTerms('my search input', 'or');

    expect(formattedTerms).toBe('my:* | search:* | input:*');
  });
});
