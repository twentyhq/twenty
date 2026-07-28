import { getExternalLinkDisplayUrl } from '@/front-components/utils/getExternalLinkDisplayUrl';

describe('getExternalLinkDisplayUrl', () => {
  it('should strip the scheme and the trailing slash of a bare domain', () => {
    expect(getExternalLinkDisplayUrl('https://nvidia.com/')).toBe('nvidia.com');
  });

  it('should strip the www subdomain', () => {
    expect(getExternalLinkDisplayUrl('https://www.nvidia.com')).toBe(
      'nvidia.com',
    );
  });

  it('should keep the path, the search params and the hash', () => {
    expect(
      getExternalLinkDisplayUrl('https://nvidia.com/drivers?os=mac#latest'),
    ).toBe('nvidia.com/drivers?os=mac#latest');
  });

  it('should keep the port', () => {
    expect(getExternalLinkDisplayUrl('http://localhost:3000/app')).toBe(
      'localhost:3000/app',
    );
  });

  it('should return the untouched value when the url cannot be parsed', () => {
    expect(getExternalLinkDisplayUrl('not-a-url')).toBe('not-a-url');
  });
});
