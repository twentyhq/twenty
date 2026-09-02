import { describe, expect, it } from 'vitest';

import { THEME_COLOR_HEX } from 'src/front-components/constants/theme-color-hex.constant';
import { getThemeColorFromHex } from 'src/front-components/utils/get-theme-color-from-hex.util';
import { normalizeHexColor } from 'src/front-components/utils/normalize-hex-color.util';

describe('normalizeHexColor', () => {
  it('expands short hex values', () => {
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
  });

  it('lowercases long hex values', () => {
    expect(normalizeHexColor(' #1D1D1D ')).toBe('#1d1d1d');
  });

  it('rejects anything that is not a hex colour', () => {
    expect(normalizeHexColor('color(display-p3 0.83 0.329 0.324)')).toBeUndefined();
    expect(normalizeHexColor('red')).toBeUndefined();
    expect(normalizeHexColor('')).toBeUndefined();
  });
});

describe('getThemeColorFromHex', () => {
  it('maps a stored hex back to its theme colour name', () => {
    expect(getThemeColorFromHex('#3E63DD')).toBe('blue');
    expect(getThemeColorFromHex('#e5484d')).toBe('red');
  });

  it('returns undefined for a colour outside the palette', () => {
    expect(getThemeColorFromHex('#1d1d1d')).toBeUndefined();
  });

  it('stores every palette colour as a hex the bot image validator accepts', () => {
    const hexPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    for (const hex of Object.values(THEME_COLOR_HEX)) {
      expect(hex).toMatch(hexPattern);
    }
  });
});
