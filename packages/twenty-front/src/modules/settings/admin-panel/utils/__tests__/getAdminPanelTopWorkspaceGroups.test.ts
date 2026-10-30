import { getAdminPanelTopWorkspaceGroups } from '@/settings/admin-panel/utils/getAdminPanelTopWorkspaceGroups';

const APPLE = {
  id: 'workspace-apple',
  name: 'Apple',
  logoUrl: null,
  subdomain: 'apple',
  totalUsers: 12,
};
const YCOMBINATOR = {
  id: 'workspace-ycombinator',
  name: 'YCombinator',
  logoUrl: null,
  subdomain: 'yc',
  totalUsers: 4,
};
const YCOMBINATOR_CURRENT_WORKSPACE = {
  id: 'workspace-ycombinator',
  displayName: 'YCombinator',
  logo: null,
  subdomain: 'yc',
  workspaceMembersCount: 3,
};
const ACME_CURRENT_WORKSPACE = {
  id: 'workspace-acme',
  displayName: 'Acme',
  logo: 'acme-logo.png',
  subdomain: 'acme',
  workspaceMembersCount: 2,
};

describe('getAdminPanelTopWorkspaceGroups', () => {
  it('should move the listed current workspace into its own first group', () => {
    expect(
      getAdminPanelTopWorkspaceGroups({
        topWorkspaces: [APPLE, YCOMBINATOR],
        currentWorkspace: YCOMBINATOR_CURRENT_WORKSPACE,
        searchTerm: '',
      }),
    ).toEqual([[YCOMBINATOR], [APPLE]]);
  });

  it('should pin the current workspace when it is outside the top workspaces', () => {
    expect(
      getAdminPanelTopWorkspaceGroups({
        topWorkspaces: [APPLE, YCOMBINATOR],
        currentWorkspace: ACME_CURRENT_WORKSPACE,
        searchTerm: '',
      }),
    ).toEqual([
      [
        {
          id: 'workspace-acme',
          name: 'Acme',
          logoUrl: 'acme-logo.png',
          subdomain: 'acme',
          totalUsers: 2,
        },
      ],
      [APPLE, YCOMBINATOR],
    ]);
  });

  it('should only show search results when the current workspace does not match', () => {
    expect(
      getAdminPanelTopWorkspaceGroups({
        topWorkspaces: [APPLE],
        currentWorkspace: ACME_CURRENT_WORKSPACE,
        searchTerm: 'app',
      }),
    ).toEqual([[APPLE]]);

    expect(
      getAdminPanelTopWorkspaceGroups({
        topWorkspaces: [],
        currentWorkspace: ACME_CURRENT_WORKSPACE,
        searchTerm: 'zzz',
      }),
    ).toEqual([]);
  });
});
