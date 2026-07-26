import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsWorkspaceMembersInviteTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersInviteTab';

jest.mock(
  '@/settings/roles/components/SettingsRolesQueryEffect',
  () => ({
    SettingsRolesQueryEffect: jest.fn(() => null),
  }),
);

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/settings/roles/hooks/useSettingsAllRoles', () => ({
  useSettingsAllRoles: jest.fn(),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomStateValue',
  () => ({
    useAtomStateValue: jest.fn(),
  }),
);

jest.mock(
  '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation',
  () => ({
    useDeleteWorkspaceInvitation: jest.fn(),
  }),
);

jest.mock(
  '@/workspace-invitation/hooks/useResendWorkspaceInvitation',
  () => ({
    useResendWorkspaceInvitation: jest.fn(),
  }),
);

jest.mock('@/workspace/components/WorkspaceInviteTeam', () => ({
  WorkspaceInviteTeam: jest.fn(() => null),
}));

jest.mock(
  '@/settings/security/components/approvedAccessDomains/SettingsApprovedAccessDomainsListCard',
  () => ({
    SettingsApprovedAccessDomainsListCard: jest.fn(() => null),
  }),
);

describe('SettingsWorkspaceMembersInviteTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useQuery } = require('@apollo/client/react');
    useQuery.mockReturnValue({
      data: { findWorkspaceInvitations: [] },
      loading: false,
    });

    const { useSettingsAllRoles } = require('@/settings/roles/hooks/useSettingsAllRoles');
    useSettingsAllRoles.mockReturnValue([]);

    const { useAtomStateValue } = require('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
    useAtomStateValue.mockReturnValue({
      id: 'workspace-1',
      inviteHash: null,
      isPublicInviteLinkEnabled: false,
    });
  });

  it('should render SettingsRolesQueryEffect to load roles on invite tab', () => {
    render(
      <MemoryRouter>
        <SettingsWorkspaceMembersInviteTab />
      </MemoryRouter>,
    );

    const { SettingsRolesQueryEffect } = require('@/settings/roles/components/SettingsRolesQueryEffect');
    expect(SettingsRolesQueryEffect).toHaveBeenCalled();
  });
});
