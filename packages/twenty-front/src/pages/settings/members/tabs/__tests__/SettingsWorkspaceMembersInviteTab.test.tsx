import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsWorkspaceMembersInviteTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersInviteTab';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/settings/roles/hooks/useSettingsAllRoles', () => ({
  useSettingsAllRoles: jest.fn(),
}));

jest.mock('@/settings/roles/hooks/useCurrentWorkspace', () => ({
  useCurrentWorkspace: jest.fn(),
}));

describe('SettingsWorkspaceMembersInviteTab', () => {
  it('should render SettingsWorkspaceMembersInviteTab', () => {
    const { useQuery } = require('@apollo/client/react');
    useQuery.mockReturnValue({
      data: { findWorkspaceInvitations: [] },
      loading: false,
    });

    const { useSettingsAllRoles } = require('@/settings/roles/hooks/useSettingsAllRoles');
    useSettingsAllRoles.mockReturnValue([]);

    const { useCurrentWorkspace } = require('@/settings/roles/hooks/useCurrentWorkspace');
    useCurrentWorkspace.mockReturnValue({
      id: 'workspace-1',
      inviteHash: null,
      isPublicInviteLinkEnabled: false,
    });

    render(
      <MemoryRouter>
        <SettingsWorkspaceMembersInviteTab />
      </MemoryRouter>
    );
  });
});
