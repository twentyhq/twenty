import { checkUrlType } from '~/utils/checkUrlType';

describe('checkUrlType', () => {
  it('should return "linkedin", if linkedin url', () => {
    expect(checkUrlType('https://www.linkedin.com/in/håkan-fisk')).toBe(
      'linkedin',
    );
  });

  it('should return "twitter", if twitter url', () => {
    expect(checkUrlType('https://www.twitter.com/john-doe')).toBe('twitter');
  });

  it('should return "url", if neither linkedin nor twitter url', () => {
    expect(checkUrlType('https://www.example.com')).toBe('url');
  });
});
