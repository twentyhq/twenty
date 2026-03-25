import { checkUrlType } from '~/utils/checkUrlType';

describe('checkUrlType', () => {
  it('should return "linkedin", if linkedin url', () => {
    expect(checkUrlType('https://www.linkedin.com/in/håkan-fisk')).toBe(
      'linkedin',
    );
    expect(checkUrlType('http://www.linkedin.com/in/håkan-fisk')).toBe(
      'linkedin',
    );
    expect(checkUrlType('https://linkedin.com/in/håkan-fisk')).toBe('linkedin');
    expect(checkUrlType('http://linkedin.com/in/håkan-fisk')).toBe('linkedin');
    expect(checkUrlType('linkedin.com/in/håkan-fisk')).toBe('linkedin');
  });

  it('should return "twitter", if twitter url', () => {
    expect(checkUrlType('https://www.twitter.com/john-doe')).toBe('twitter');
    expect(checkUrlType('https://www.x.com/john-doe')).toBe('twitter');
  });

  it('should return "url", if neither linkedin nor twitter url', () => {
    expect(checkUrlType('https://www.example.com')).toBe('url');
  });

  it('should return "facebook", if facebook url', () => {
    expect(checkUrlType('https://www.facebook.com/john-doe')).toBe('facebook');
  });
});
