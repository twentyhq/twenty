import { describe, expect, it } from 'vitest';

import { firstFileUrl, resolvePartnerPictureUrl } from './profile-picture';

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

describe('resolvePartnerPictureUrl', () => {
  it('prefers the uploaded file url over the legacy link', () => {
    expect(
      resolvePartnerPictureUrl([{ url: 'https://x/file.png' }], 'https://x/legacy.png'),
    ).toBe('https://x/file.png');
  });
  it('falls back to the legacy link when there is no file', () => {
    expect(resolvePartnerPictureUrl(null, 'https://x/legacy.png')).toBe('https://x/legacy.png');
    expect(resolvePartnerPictureUrl([], 'https://x/legacy.png')).toBe('https://x/legacy.png');
    expect(resolvePartnerPictureUrl([{ url: null }], 'https://x/legacy.png')).toBe(
      'https://x/legacy.png',
    );
  });
  it('returns null when neither source has a url', () => {
    expect(resolvePartnerPictureUrl(null, null)).toBeNull();
    expect(resolvePartnerPictureUrl(undefined, undefined)).toBeNull();
    expect(resolvePartnerPictureUrl([], null)).toBeNull();
  });
});
