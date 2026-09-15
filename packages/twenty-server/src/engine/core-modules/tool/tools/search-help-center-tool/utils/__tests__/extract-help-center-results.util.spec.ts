import { extractHelpCenterResults } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/extract-help-center-results.util';

describe('extractHelpCenterResults', () => {
  it('passes a bare array straight through', () => {
    const results = [{ title: 'Importing data' }];

    expect(extractHelpCenterResults(results)).toBe(results);
  });

  it('unwraps a results envelope', () => {
    const results = [{ title: 'Inviting a team member' }];

    expect(extractHelpCenterResults({ results })).toBe(results);
  });

  it('returns an empty array for a payload it cannot read', () => {
    // Reading `.length` off these is what produced
    // "Found undefined relevant help center articles".
    expect(extractHelpCenterResults({ error: 'Rate limit exceeded' })).toEqual(
      [],
    );
    expect(extractHelpCenterResults('unexpected')).toEqual([]);
    expect(extractHelpCenterResults(null)).toEqual([]);
    expect(extractHelpCenterResults(undefined)).toEqual([]);
  });

  it('always returns an array, so length is never undefined', () => {
    for (const payload of [[], { results: [] }, {}, null, undefined, 0, 'x']) {
      const results = extractHelpCenterResults(payload);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toEqual(expect.any(Number));
    }
  });
});
