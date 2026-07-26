import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsWorkspaceMembersInviteTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersInviteTab';

// Mock SettingsRolesQueryEffect to track if it's rendered
jest.mock(
  '@/settings/roles/components/SettingsRolesQueryEffect',
  () => ({
    SettingsRolesQueryEffect: () => (
      <div data-testid="settings-roles-query-effect" />
    ),
  }),
);

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/settings/roles/hooks/useSettingsAllRoles', () => ({
  useSettingsAllRoles: jest.fn(),
}));

jest.mock('recoil', () => ({
  useRecoilValue: jest.fn(),
  useRecoilState: jest.fn(),
  atom: jest.fn(),
  selector: jest.fn(),
}));

jest.mock('jotai', () => ({
  useAtomStateValue: jest.fn(),
  useAtom: jest.fn(),
  atom: jest.fn(),
}));

describe('SettingsWorkspaceMembersInviteTab', () => {
  beforeEach(() => {
    const { useQuery } = require('@apollo/client/react');
    useQuery.mockReturnValue({
      data: { findWorkspaceInvitations: [] },
      loading: false,
    });

    const { useSettingsAllRoles } = require('@/settings/roles/hooks/useSettingsAllRoles');
    useSettingsAllRoles.mockReturnValue([]);

    const { useAtomStateValue } = require('jotai');
    useAtomStateValue.mockReturnValue({
      id: 'workspace-1',
      inviteHash: null,
      isPublicInviteLinkEnabled: false,
    });
  });

  it('should render SettingsRolesQueryEffect to load roles', () => {
    render(
      <MemoryRouter>
        <SettingsWorkspaceMembersInviteTab />
      </MemoryRouter>,
    );

    // This validates the fix: SettingsRolesQueryEffect is rendered in the invite tab
    // which ensures roles are loaded regardless of which settings page the user visits.
    expect(
      screen.getByTestId('settings-roles-query-effect'),
    ).toBeTruthy();
  });

  it('should render the invite form', () => {
    render(
      <MemoryRouter>
        <SettingsWorkspaceMembersInviteTab />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Members/)).toBeTruthy();
  });
});
