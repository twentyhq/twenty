import { toSidePanelLocation } from '@/side-panel/routing/utils/toSidePanelLocation';

describe('toSidePanelLocation', () => {
  it('should split a path into a location', () => {
    expect(toSidePanelLocation('/settings/objects/companies')).toMatchObject({
      pathname: '/settings/objects/companies',
      search: '',
      hash: '',
    });
  });

  it('should keep the search and the hash', () => {
    expect(
      toSidePanelLocation('/settings/objects/companies?tab=fields#name'),
    ).toMatchObject({
      pathname: '/settings/objects/companies',
      search: '?tab=fields',
      hash: '#name',
    });
  });
});
