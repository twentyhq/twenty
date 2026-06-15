import { describe, expect, it } from 'vitest';

import { firstFileUrl } from './profile-picture';

describe('firstFileUrl', () => {
  it('returns the first file url', () => {
    expect(firstFileUrl([{ url: 'https://x/a.png' }, { url: 'https://x/b.png' }])).toBe('https://x/a.png');
  });
  it('skips entries without a url', () => {
    expect(firstFileUrl([{ url: null }, { url: 'https://x/b.png' }])).toBe('https://x/b.png');
  });
  it('returns null for empty / nullish input', () => {
    expect(firstFileUrl(null)).toBeNull();
    expect(firstFileUrl(undefined)).toBeNull();
    expect(firstFileUrl([])).toBeNull();
    expect(firstFileUrl([null])).toBeNull();
  });
});
