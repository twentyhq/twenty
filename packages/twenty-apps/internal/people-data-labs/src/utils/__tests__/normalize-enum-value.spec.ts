import { describe, expect, it } from 'vitest';

import { normalizeEnumValue } from 'src/utils/normalize-enum-value';

describe('normalizeEnumValue', () => {
  it('uppercases a simple value', () => {
    expect(normalizeEnumValue('engineering')).toBe('ENGINEERING');
  });

  it('collapses spaces into a single underscore', () => {
    expect(normalizeEnumValue('computer software')).toBe('COMPUTER_SOFTWARE');
  });

  it('collapses punctuation runs into a single underscore', () => {
    expect(normalizeEnumValue('airlines/aviation')).toBe('AIRLINES_AVIATION');
    expect(normalizeEnumValue('san francisco, california')).toBe(
      'SAN_FRANCISCO_CALIFORNIA',
    );
  });

  it('strips diacritics', () => {
    expect(normalizeEnumValue('Montréal')).toBe('MONTREAL');
  });

  it('prefixes a leading digit with an underscore', () => {
    expect(normalizeEnumValue('3m')).toBe('_3M');
  });
});
