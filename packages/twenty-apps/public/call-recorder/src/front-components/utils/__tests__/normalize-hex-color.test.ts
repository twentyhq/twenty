import { describe, expect, it } from 'vitest';

import { normalizeHexColor } from 'src/front-components/utils/normalize-hex-color.util';

describe('normalizeHexColor', () => {
  it('expands short hex values', () => {
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
  });

  it('lowercases long hex values', () => {
    expect(normalizeHexColor(' #1D1D1D ')).toBe('#1d1d1d');
  });

  it('rejects anything that is not a hex colour', () => {
    expect(
      normalizeHexColor('color(display-p3 0.83 0.329 0.324)'),
    ).toBeUndefined();
    expect(normalizeHexColor('red')).toBeUndefined();
    expect(normalizeHexColor('')).toBeUndefined();
  });
});
