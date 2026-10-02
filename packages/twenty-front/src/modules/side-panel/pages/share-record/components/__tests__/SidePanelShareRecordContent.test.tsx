import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  ObjectSharingReach,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RecordSharingMode,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SidePanelShareRecordContent } from '@/side-panel/pages/share-record/components/SidePanelShareRecordContent';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const setGeneralAccess = jest.fn();
const setShare = jest.fn();
const removeShare = jest.fn();
const refetch = jest.fn();
const copyToClipboard = jest.fn();

jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard }),
}));

type Share = RecordSharingFieldsFragment['shares'][number];

const sharing: RecordSharingFieldsFragment = {
  sharingMode: RecordSharingMode.PRIVATE,
  canManageSharing: true,
  permissions: {
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canSoftDelete: true,
  },
  generalAccessLevel: RecordShareAccessLevel.NONE,
  defaultGeneralAccessLevel: RecordShareAccessLevel.NONE,
  hasManagedGeneralAccess: false,
  roles: [{ id: 'sales-role', label: 'Sales', canRead: true, canUpdate: true }],
  shares: [],
};

const buildShare = (share: Partial<Share>): Share => ({
  id: 'grant',
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  principalId: 'alice-member',
  principalRoleId: null,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
  ...share,
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <MemoryRouter>{children}</MemoryRouter>
    </I18nProvider>
  </JotaiProvider>
);

const renderSharing = ({
  sharingOverrides = {},
  sharingReach = ObjectSharingReach.WORKSPACE,
  error,
}: {
  sharingOverrides?: Partial<RecordSharingFieldsFragment>;
  sharingReach?: ObjectSharingReach;
  error?: Error;
} = {}) =>
  render(
    <SidePanelShareRecordContent
      recordUrl="https://example.com/record"
      objectLabelPlural="Companies"
      sharingReach={sharingReach}
      sharingState={{
        sharing: { ...sharing, ...sharingOverrides },
        setGeneralAccess,
        setShare,
        removeShare,
        refetch,
        loading: false,
        saving: false,
        error,
      }}
    />,
    {
      wrapper: Wrapper,
    },
  );

describe('Share record side panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    refetch.mockResolvedValue(undefined);
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      {
        id: 'alice-member',
        name: { firstName: 'Alice', lastName: 'Smith' },
        userEmail: 'alice@example.com',
      } as never,
    ]);
  });

  it('finds a workspace member by email and grants viewing access', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(
      screen.getByRole('button', { name: 'Add people or roles' }),
    );
    await user.type(
      screen.getByPlaceholderText('Search people or roles'),
      'alice@',
    );
    expect(screen.queryByText('Sales')).toBeNull();
    await user.click(screen.getByText('Alice Smith'));
    expect(setShare).toHaveBeenCalledWith({
      principal: { workspaceMemberId: 'alice-member' },
      accessLevel: RecordShareAccessLevel.READ,
    });
  });

  it('finds a role by name and grants viewing access', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(
      screen.getByRole('button', { name: 'Add people or roles' }),
    );
    await user.type(
      screen.getByPlaceholderText('Search people or roles'),
      'sales',
    );
    expect(screen.queryByText('Alice Smith')).toBeNull();
    await user.click(screen.getByText('Sales'));
    expect(setShare).toHaveBeenCalledWith({
      principal: { roleId: 'sales-role' },
      accessLevel: RecordShareAccessLevel.READ,
    });
  });

  it('enables workspace-wide viewing through the general access', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(screen.getByRole('button', { name: 'Restricted' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Viewer' }));
    expect(setGeneralAccess).toHaveBeenCalledWith(RecordShareAccessLevel.READ);
    expect(setShare).not.toHaveBeenCalled();
  });

  it('returns to restricted access without removing named recipients', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharingOverrides: {
        generalAccessLevel: RecordShareAccessLevel.READ,
        shares: [buildShare({})],
      },
    });
    await user.click(
      screen.getByRole('button', {
        name: /^Everyone with access to Companies/,
      }),
    );
    await user.click(
      screen.getByRole('menuitemradio', { name: 'Restricted (default)' }),
    );
    expect(setGeneralAccess).toHaveBeenCalledWith(RecordShareAccessLevel.NONE);
    expect(removeShare).not.toHaveBeenCalled();
  });

  it('shows workspace access managed by an application', async () => {
    renderSharing({ sharingOverrides: { hasManagedGeneralAccess: true } });
    await waitFor(() =>
      expect(
        screen.getByText('Workspace access is also managed by an application.'),
      ).toBeVisible(),
    );
    expect(
      screen.getByRole('button', { name: 'Everyone with access to Companies' }),
    ).toBeVisible();
  });

  it('hides management when the server says the viewer cannot manage sharing', async () => {
    renderSharing({
      sharingOverrides: { canManageSharing: false, roles: [] },
    });
    await waitFor(() =>
      expect(
        screen.getByText(
          'Only the creator of this record and people with full access to it can change who has access.',
        ),
      ).toBeVisible(),
    );
    expect(screen.queryByText('General access')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Add people or roles' }),
    ).toBeNull();
    expect(screen.getByText('Copy link')).toBeVisible();
  });

  it('supports keyboard selection and reports empty searches', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(
      screen.getByRole('button', { name: 'Add people or roles' }),
    );
    const input = screen.getByPlaceholderText('Search people or roles');
    await user.type(input, 'no match');
    expect(screen.getByText('No matching people or roles')).toBeVisible();
    await user.clear(input);
    await user.type(input, 'sales');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Sales Role' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(setShare).toHaveBeenCalledWith({
      principal: { roleId: 'sales-role' },
      accessLevel: RecordShareAccessLevel.READ,
    });
  });

  it('keeps invitations out of the main menu and removes access through the recipient submenu', async () => {
    const user = userEvent.setup();
    renderSharing({ sharingOverrides: { shares: [buildShare({})] } });
    expect(screen.queryByPlaceholderText('Search people or roles')).toBeNull();
    expect(screen.queryByText('Remove access')).toBeNull();
    await user.click(
      screen.getByRole('button', { name: 'Alice Smith Viewer' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Remove access' }));
    expect(removeShare).toHaveBeenCalledWith({
      principal: { workspaceMemberId: 'alice-member' },
    });
    expect(setShare).not.toHaveBeenCalled();
  });

  it('copies the supplied record link', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(copyToClipboard).toHaveBeenCalledWith('https://example.com/record');
  });

  it('shows a retry action when settings cannot be loaded', async () => {
    const user = userEvent.setup();
    renderSharing({ error: new Error('offline') });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sharing settings could not be loaded.',
    );
    await user.click(screen.getByText('Try again'));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Add people or roles' }),
    ).toBeNull();
  });

  it('shows application and owner grants without offering to revoke them', async () => {
    renderSharing({
      sharingOverrides: {
        shares: [
          buildShare({
            id: 'owner',
            accessLevel: RecordShareAccessLevel.FULL,
            rowCause: RecordShareRowCause.OWNER,
          }),
          buildShare({
            id: 'app',
            principalType: RecordSharePrincipalType.ROLE,
            principalId: 'sales-role',
            rowCause: RecordShareRowCause.APPLICATION,
          }),
        ],
      },
    });
    await waitFor(() => expect(screen.getByText('Owner')).toBeVisible());
    expect(screen.getByText('Managed access')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
  });

  it('explains inherited access instead of promising a manual revocation removes it', async () => {
    renderSharing({
      sharingOverrides: { sharingMode: RecordSharingMode.INHERITED },
    });
    await waitFor(() =>
      expect(
        screen.getByText(/Access is also inherited from related records/),
      ).toBeVisible(),
    );
  });

  it.each([
    [
      'Alice Smith',
      { workspaceMemberId: 'alice-member' },
      'Editor',
      RecordShareAccessLevel.READ_WRITE,
    ],
    [
      'Sales',
      { roleId: 'sales-role' },
      'Editor',
      RecordShareAccessLevel.READ_WRITE,
    ],
    [
      'Alice Smith',
      { workspaceMemberId: 'alice-member' },
      'Full access',
      RecordShareAccessLevel.FULL,
    ],
    [
      'Sales',
      { roleId: 'sales-role' },
      'Full access',
      RecordShareAccessLevel.FULL,
    ],
  ])(
    'can invite %s as %s',
    async (label, principal, accessLabel, accessLevel) => {
      const user = userEvent.setup();
      renderSharing();
      await user.click(
        screen.getByRole('button', { name: 'Add people or roles' }),
      );
      await user.click(
        screen.getByRole('button', { name: 'Invitation access' }),
      );
      await user.click(
        screen.getByRole('menuitemradio', { name: accessLabel }),
      );
      await user.keyboard('{Escape}');
      await user.click(screen.getByText(label));
      expect(setShare).toHaveBeenCalledWith({ principal, accessLevel });
    },
  );

  it.each([
    [
      'Alice Smith',
      RecordSharePrincipalType.WORKSPACE_MEMBER,
      'alice-member',
      { workspaceMemberId: 'alice-member' },
    ],
    [
      'Sales',
      RecordSharePrincipalType.ROLE,
      'sales-role',
      { roleId: 'sales-role' },
    ],
  ])(
    'can upgrade and downgrade %s without removing their grant',
    async (label, principalType, principalId, principal) => {
      const user = userEvent.setup();
      const share = buildShare({ principalType, principalId });
      const view = renderSharing({ sharingOverrides: { shares: [share] } });
      await user.click(
        screen.getByRole('button', { name: new RegExp(`^${label}`) }),
      );
      await user.click(screen.getByText('Full access'));
      expect(setShare).toHaveBeenLastCalledWith({
        principal,
        accessLevel: RecordShareAccessLevel.FULL,
      });
      view.unmount();
      renderSharing({
        sharingOverrides: {
          shares: [{ ...share, accessLevel: RecordShareAccessLevel.FULL }],
        },
      });
      await user.click(
        screen.getByRole('button', { name: new RegExp(`^${label}`) }),
      );
      await user.click(screen.getAllByText('Viewer').at(-1)!);
      expect(setShare).toHaveBeenLastCalledWith({
        principal,
        accessLevel: RecordShareAccessLevel.READ,
      });
      expect(removeShare).not.toHaveBeenCalled();
    },
  );

  it('can upgrade and downgrade the general access', async () => {
    const user = userEvent.setup();
    const view = renderSharing({
      sharingOverrides: { generalAccessLevel: RecordShareAccessLevel.READ },
    });
    await user.click(
      screen.getByRole('button', {
        name: /^Everyone with access to Companies/,
      }),
    );
    await user.click(screen.getByText('Full access'));
    expect(setGeneralAccess).toHaveBeenLastCalledWith(
      RecordShareAccessLevel.FULL,
    );
    view.unmount();
    renderSharing({
      sharingOverrides: { generalAccessLevel: RecordShareAccessLevel.FULL },
    });
    await user.click(
      screen.getByRole('button', {
        name: /^Everyone with access to Companies/,
      }),
    );
    await user.click(screen.getAllByText('Viewer').at(-1)!);
    expect(setGeneralAccess).toHaveBeenLastCalledWith(
      RecordShareAccessLevel.READ,
    );
  });

  it('tells viewers of a record open by default who can change its access', async () => {
    renderSharing({
      sharingOverrides: {
        sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
        canManageSharing: false,
        roles: [],
      },
    });
    await waitFor(() =>
      expect(
        screen.getByText(
          'Only the creator of this record, people with full access to it and admins can change who has access.',
        ),
      ).toBeVisible(),
    );
  });

  it('marks the default access the server reports and lets owners restrict it', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharingOverrides: {
        sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
        generalAccessLevel: RecordShareAccessLevel.READ_WRITE,
        defaultGeneralAccessLevel: RecordShareAccessLevel.READ_WRITE,
      },
    });
    await user.click(
      screen.getByRole('button', {
        name: 'Everyone with access to Companies Editor',
      }),
    );
    expect(
      screen.getByRole('menuitemradio', { name: 'Editor (default)' }),
    ).toBeVisible();
    await user.click(screen.getByRole('menuitemradio', { name: 'Restricted' }));
    expect(setGeneralAccess).toHaveBeenCalledWith(RecordShareAccessLevel.NONE);
  });

  it.each([
    [
      ObjectSharingReach.WORKSPACE,
      "Gets this record only: their role can't access Companies",
    ],
    [
      ObjectSharingReach.ROLE_ACCESS,
      "Won't see it: their role can't access Companies",
    ],
  ])(
    'explains what a grant does for a role without access when sharing reach is %s',
    async (sharingReach, note) => {
      renderSharing({
        sharingReach,
        sharingOverrides: {
          roles: [
            {
              id: 'member-role',
              label: 'Member',
              canRead: false,
              canUpdate: false,
            },
          ],
          shares: [buildShare({ principalRoleId: 'member-role' })],
        },
      });
      await waitFor(() => expect(screen.getByText(note)).toBeVisible());
    },
  );
});
