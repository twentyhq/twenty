import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';
import { matchSidePanelHostableRoute } from '@/side-panel/routing/utils/matchSidePanelHostableRoute';

describe('matchSidePanelHostableRoute', () => {
  it('should match an object settings path', () => {
    expect(
      matchSidePanelHostableRoute('/settings/objects/companies')?.route.path,
    ).toBe('/settings/objects/:objectNamePlural');
  });

  it('should match a field settings path', () => {
    expect(
      matchSidePanelHostableRoute('/settings/objects/companies/name')?.route.path,
    ).toBe('/settings/objects/:objectNamePlural/:fieldName');
  });

  it('should match a record index path', () => {
    expect(matchSidePanelHostableRoute('/objects/companies')?.route.path).toBe(
      '/objects/:objectNamePlural',
    );
  });

  it('should match a record show path', () => {
    expect(matchSidePanelHostableRoute('/object/company/record-1')?.route.path).toBe(
      '/object/:objectNameSingular/:objectRecordId',
    );
  });

  it('should ignore the search and hash when matching', () => {
    expect(
      isSidePanelHostablePath('/settings/objects/companies?tab=fields#top'),
    ).toBe(true);
    expect(isSidePanelHostablePath('/objects/companies?viewId=view-1')).toBe(
      true,
    );
  });

  it('should not match a route that is not hostable', () => {
    expect(isSidePanelHostablePath('/settings/billing')).toBe(false);
    expect(isSidePanelHostablePath('/settings/objects')).toBe(false);
  });
});
