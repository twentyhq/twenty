import { describe, expect, it } from 'vitest';

import { mapLegacyScope } from '../partner-scope-map';

describe('mapLegacyScope', () => {
  it('maps each legacy value to its new category', () => {
    expect(mapLegacyScope(['APPS'])).toEqual(['DEVELOPMENT']);
    expect(mapLegacyScope(['DATA_MODEL'])).toEqual(['SOLUTIONING']);
    expect(mapLegacyScope(['DATA_MIGRATION'])).toEqual(['SOLUTIONING']);
    expect(mapLegacyScope(['WORKFLOWS'])).toEqual(['SOLUTIONING']);
    expect(mapLegacyScope(['HOSTING_ENVIRONMENT'])).toEqual(['HOSTING']);
  });

  it('de-duplicates collapsed values', () => {
    expect(mapLegacyScope(['DATA_MODEL', 'DATA_MIGRATION', 'WORKFLOWS'])).toEqual([
      'SOLUTIONING',
    ]);
  });

  it('passes through already-migrated values unchanged', () => {
    expect(mapLegacyScope(['ADVISORY', 'HOSTING'])).toEqual(['ADVISORY', 'HOSTING']);
  });
});
