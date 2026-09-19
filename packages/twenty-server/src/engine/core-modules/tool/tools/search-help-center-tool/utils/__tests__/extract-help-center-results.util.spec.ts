import { extractHelpCenterResults } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/extract-help-center-results.util';

describe('extractHelpCenterResults', () => {
  it('passes a bare array straight through', () => {
    const results = [{ title: 'Importing data' }];

    expect(extractHelpCenterResults(results)).toEqual({
      isReadable: true,
      results,
    });
  });

  it('unwraps a results envelope', () => {
    const results = [{ title: 'Inviting a team member' }];

    expect(extractHelpCenterResults({ results })).toEqual({
      isReadable: true,
      results,
    });
  });

  it('reads an empty answer as a real, readable result', () => {
    expect(extractHelpCenterResults([])).toEqual({
      isReadable: true,
      results: [],
    });
    expect(extractHelpCenterResults({ results: [] })).toEqual({
      isReadable: true,
      results: [],
    });
  });

  it('reports an unrecognized payload as unreadable rather than empty', () => {
    // Collapsing these to `[]` would present an operational failure as a
    // successful search that simply found nothing.
    for (const payload of [
      { error: 'Rate limit exceeded' },
      { results: 'not-an-array' },
      'unexpected',
      null,
      undefined,
      0,
    ]) {
      expect(extractHelpCenterResults(payload)).toEqual({ isReadable: false });
    }
  });

  it('never yields a results value whose length is undefined', () => {
    for (const payload of [[], { results: [] }, {}, null, 'x']) {
      const extraction = extractHelpCenterResults(payload);

      if (extraction.isReadable) {
        expect(Array.isArray(extraction.results)).toBe(true);
        expect(extraction.results.length).toEqual(expect.any(Number));
      }
    }
  });
});
