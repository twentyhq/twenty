import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';
import { matchSidePanelHostableRoute } from '@/side-panel/routing/utils/matchSidePanelHostableRoute';

describe('matchSidePanelHostableRoute', () => {
  it('should match an object settings path', () => {
    expect(
      matchSidePanelHostableRoute('/settings/objects/companies')?.path,
    ).toBe('/settings/objects/:objectNamePlural');
  });

  it('should match a field settings path', () => {
    expect(
      matchSidePanelHostableRoute('/settings/objects/companies/name')?.path,
    ).toBe('/settings/objects/:objectNamePlural/:fieldName');
  });

  it('should ignore the search and hash when matching', () => {
    expect(
      isSidePanelHostablePath('/settings/objects/companies?tab=fields#top'),
    ).toBe(true);
  });

  it('should not match a route that is not hostable', () => {
    expect(isSidePanelHostablePath('/settings/billing')).toBe(false);
    expect(isSidePanelHostablePath('/objects/companies')).toBe(false);
  });
});
