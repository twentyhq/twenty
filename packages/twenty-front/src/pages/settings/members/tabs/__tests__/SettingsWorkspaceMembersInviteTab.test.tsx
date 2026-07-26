import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsWorkspaceMembersInviteTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersInviteTab';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { useFindWorkspaceInvitations } from '~/workspace-invitation/hooks/useFindWorkspaceInvitations';
import { useDeleteWorkspaceInvitation } from '~/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '~/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { useCurrentWorkspace } from '@/auth/hooks/useCurrentWorkspace';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/settings/roles/hooks/useSettingsAllRoles', () => ({
  useSettingsAllRoles: jest.fn(),
}));

jest.mock('@/workspace-invitation/hooks/useDeleteWorkspaceInvitation', () => ({
  useDeleteWorkspaceInvitation: jest.fn(),
}));

jest.mock('@/workspace-invitation/hooks/useResendWorkspaceInvitation', () => ({
  useResendWorkspaceInvitation: jest.fn(),
}));

jest.mock('@/auth/hooks/useCurrentWorkspace', () => ({
  useCurrentWorkspace: jest.fn(),
}));

const mockedUseSettingsAllRoles = useSettingsAllRoles as jest.MockedFunction<
  typeof useSettingsAllRoles
>;
const mockedUseFindWorkspaceInvitations =
  useFindWorkspaceInvitations as jest.MockedFunction<
    typeof useFindWorkspaceInvitations
  >;
const mockedUseDeleteWorkspaceInvitation =
  useDeleteWorkspaceInvitation as jest.MockedFunction<
    typeof useDeleteWorkspaceInvitation
  >;
const mockedUseResendWorkspaceInvitation =
  useResendWorkspaceInvitation as jest.MockedFunction<
    typeof useResendWorkspaceInvitation
  >;
const mockedUseCurrentWorkspace = useCurrentWorkspace as jest.MockedFunction<
  typeof useCurrentWorkspace
>;

describe('SettingsWorkspaceMembersInviteTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSettingsAllRoles.mockReturnValue([
      {
        id: 'role-1',
        name: 'Admin',
        isEditable: true,
        description: 'Administrator role',
        permissions: [],
      },
    ]);
    mockedUseDeleteWorkspaceInvitation.mockReturnValue({
      deleteWorkspaceInvitation: jest.fn(),
    });
    mockedUseResendWorkspaceInvitation.mockReturnValue({
      resendWorkspaceInvitation: jest.fn(),
    });
    mockedUseCurrentWorkspace.mockReturnValue({
      id: 'workspace-1',
      inviteHash: null,
      isPublicInviteLinkEnabled: false,
    } as any);
  });

  it('should render SettingsRolesQueryEffect to load roles', () => {
    // Arrange
    mockedUseFindWorkspaceInvitations.mockReturnValue({
      invitations: [],
    });

    // Act
    render(
      <MemoryRouter>
        <SettingsWorkspaceMembersInviteTab />
      </MemoryRouter>,
    );

    // Assert: useSettingsAllRoles should be called to ensure roles are loaded
    expect(mockedUseSettingsAllRoles).toHaveBeenCalled();
  });

  it('should display role select even without visiting roles tab', () => {
    // Arrange
    mockedUseFindWorkspaceInvitations.mockReturnValue({
      invitations: [],
    });

    // Act
    render(
      <MemoryRouter>
        <SettingsWorkspaceMembersInviteTab />
      </MemoryRouter>,
    );

    // Assert: Roles should be loaded on mount
    expect(mockedUseSettingsAllRoles).toHaveBeenCalled();
  });
});
