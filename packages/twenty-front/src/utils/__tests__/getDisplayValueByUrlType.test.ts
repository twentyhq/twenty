import { LinkType } from 'twenty-ui';
import { getDisplayValueByUrlType } from '~/utils/getDisplayValueByUrlType';

describe('getDisplayValueByUrlType', () => {
  it('should return the linkedin username from the url', () => {
    expect(
      getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/in/håkan-fisk',
      }),
    ).toBe('håkan-fisk');
    expect(
      getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/in/Matías',
      }),
    ).toBe('Matías');
    expect(
      getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/in/Mårten',
      }),
    ).toBe('Mårten');
    expect(
      getDisplayValueByUrlType({
        type: LinkType.LinkedIn,
        href: 'https://www.linkedin.com/in/Sörvik',
      }),
    ).toBe('Sörvik');
  });

  it('should return the twitter username from the url', () => {
    expect(
      getDisplayValueByUrlType({
        type: LinkType.Twitter,
        href: 'https://www.twitter.com/john-doe',
      }),
    ).toBe('@john-doe');
  });
});
