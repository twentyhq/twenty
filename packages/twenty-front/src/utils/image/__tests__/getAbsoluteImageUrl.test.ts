import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

jest.mock('~/config', () => ({
  REACT_APP_SERVER_BASE_URL: 'https://example.com',
}));

describe('getAbsoluteImageUrl', () => {
  it('returns undefined for nullish or empty input', () => {
    expect(getAbsoluteImageUrl(undefined)).toBeUndefined();
    expect(getAbsoluteImageUrl(null)).toBeUndefined();
    expect(getAbsoluteImageUrl('')).toBeUndefined();
  });

  it('returns absolute http(s) URLs unchanged', () => {
    expect(getAbsoluteImageUrl('https://cdn.example.com/avatar.png')).toBe(
      'https://cdn.example.com/avatar.png',
    );
    expect(getAbsoluteImageUrl('http://cdn.example.com/avatar.png')).toBe(
      'http://cdn.example.com/avatar.png',
    );
  });

  it('resolves relative paths against the server base URL under /files', () => {
    expect(getAbsoluteImageUrl('avatars/avatar.png')).toBe(
      'https://example.com/files/avatars/avatar.png',
    );
    expect(getAbsoluteImageUrl('/avatars/avatar.png')).toBe(
      'https://example.com/files/avatars/avatar.png',
    );
  });
});
