import { parseTabRouteHash } from '@/ui/layout/tab-list/utils/parseTabRouteHash';

describe('parseTabRouteHash', () => {
  it('should read a bare tab hash', () => {
    expect(parseTabRouteHash('#general')).toEqual({ tabId: 'general' });
  });

  it('should read the section after the tab', () => {
    expect(parseTabRouteHash('#general/connections')).toEqual({
      tabId: 'general',
      sectionId: 'connections',
    });
  });

  it('should keep slashes inside the section', () => {
    expect(parseTabRouteHash('#general/a/b')).toEqual({
      tabId: 'general',
      sectionId: 'a/b',
    });
  });

  it('should drop an empty section', () => {
    expect(parseTabRouteHash('#general/')).toEqual({ tabId: 'general' });
  });

  it('should return an empty tab for an empty hash', () => {
    expect(parseTabRouteHash('')).toEqual({ tabId: '' });
  });
});
