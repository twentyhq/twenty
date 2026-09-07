import { describe, expect, it } from 'vitest';

import { buildApplicationName } from 'src/modules/application/utils/build-application-name';

describe('buildApplicationName', () => {
  it('joins both names with the separator', () => {
    expect(buildApplicationName('Acme Partners', 'Q3 Renewal')).toBe('Acme Partners · Q3 Renewal');
  });

  it('falls back to Unassigned when the partner name is missing', () => {
    expect(buildApplicationName(null, 'Q3 Renewal')).toBe('Unassigned · Q3 Renewal');
    expect(buildApplicationName(undefined, 'Q3 Renewal')).toBe('Unassigned · Q3 Renewal');
  });

  it('falls back to No brief when the opportunity name is missing', () => {
    expect(buildApplicationName('Acme Partners', null)).toBe('Acme Partners · No brief');
    expect(buildApplicationName('Acme Partners', undefined)).toBe('Acme Partners · No brief');
  });

  it('falls back to both defaults when both names are missing', () => {
    expect(buildApplicationName(null, undefined)).toBe('Unassigned · No brief');
  });
});
