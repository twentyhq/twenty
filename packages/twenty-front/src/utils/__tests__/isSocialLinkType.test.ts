import { isSocialLinkType } from '~/utils/isSocialLinkType';
import { LinkType } from 'twenty-ui/navigation';

describe('isSocialLinkType', () => {
  it('should return true for social link types', () => {
    expect(isSocialLinkType(LinkType.LinkedIn)).toBe(true);
    expect(isSocialLinkType(LinkType.Twitter)).toBe(true);
    expect(isSocialLinkType(LinkType.Facebook)).toBe(true);
    expect(isSocialLinkType(LinkType.Instagram)).toBe(true);
    expect(isSocialLinkType(LinkType.TikTok)).toBe(true);
    expect(isSocialLinkType(LinkType.Bluesky)).toBe(true);
  });

  it('should return false for a generic url type', () => {
    expect(isSocialLinkType(LinkType.Url)).toBe(false);
  });
});
