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
} from '~/generated-metadata/graphql';
import { RecordSharePrincipalType } from 'twenty-shared/types';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SidePanelShareRecordContent } from '@/side-panel/pages/share-record/components/SidePanelShareRecordContent';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const setShare = jest.fn();
const refetch = jest.fn();
const copyToClipboard = jest.fn();

jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard }),
}));

const sharing = {
  viewerAccessLevel: RecordShareAccessLevel.FULL,
  permissions: {
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canSoftDelete: true,
  },
  isEnabled: true,
  hasInheritedAccess: false,
  isOpenByDefault: false,
  generalAccessLevel: RecordShareAccessLevel.NONE,
  sharingReach: ObjectSharingReach.WORKSPACE,
  roles: [{ id: 'sales-role', label: 'Sales' }],
  shares: [],
};
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <MemoryRouter>{children}</MemoryRouter>
    </I18nProvider>
  </JotaiProvider>
);
const renderSharing = (overrides = {}) => {
  return render(
    <SidePanelShareRecordContent
      recordUrl="https://example.com/record"
      objectLabelPlural="Companies"
      sharingState={{
        sharing,
        setShare,
        refetch,
        loading: false,
        saving: false,
        error: undefined,
        ...overrides,
      }}
    />,
    {
      wrapper: Wrapper,
    },
  );
};

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
      enabled: true,
      accessLevel: 'READ',
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
      enabled: true,
      accessLevel: 'READ',
    });
  });

  it('enables workspace-wide viewing', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(screen.getByRole('button', { name: 'Restricted' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Viewer' }));
    expect(setShare).toHaveBeenCalledWith({
      principal: { everyone: true },
      enabled: true,
      accessLevel: 'READ',
    });
  });

  it('returns to restricted access without removing named recipients', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharing: {
        ...sharing,
        generalAccessLevel: RecordShareAccessLevel.READ,
        shares: [
          {
            id: 'everyone',
            principalType: RecordSharePrincipalType.EVERYONE,
            principalId: 'everyone',
            accessLevel: 'READ',
            rowCause: 'MANUAL',
            canRoleRead: null,
            canRoleUpdate: null,
          },
        ],
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
    expect(setShare).toHaveBeenCalledWith({
      principal: { everyone: true },
      enabled: false,
    });
  });

  it.each([
    [RecordShareAccessLevel.READ, false],
    [RecordShareAccessLevel.READ_WRITE, true],
    [RecordShareAccessLevel.FULL, false],
  ])(
    'hides management for %s with update permission %s',
    async (viewerAccessLevel, canUpdate) => {
      renderSharing({
        sharing: {
          ...sharing,
          viewerAccessLevel,
          permissions: {
            canRead: true,
            canUpdate,
            canDelete: false,
            canSoftDelete: false,
          },
          roles: [],
        },
      });
      await waitFor(() =>
        expect(
          screen.getByText(
            'Only the creator of this record and people with full access to it can change who has access.',
          ),
        ).toBeVisible(),
      );
      expect(screen.queryByText('General access')).toBeNull();
      expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
      expect(screen.getByText('Copy link')).toBeVisible();
    },
  );

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
      enabled: true,
      accessLevel: 'READ',
    });
  });

  it('keeps invitations out of the main menu and removes access through the recipient submenu', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharing: {
        ...sharing,
        shares: [
          {
            id: 'grant',
            principalType: 'WORKSPACE_MEMBER',
            principalId: 'alice-member',
            accessLevel: 'READ',
            rowCause: 'MANUAL',
          },
        ],
      },
    });
    expect(screen.queryByPlaceholderText('Search people or roles')).toBeNull();
    expect(screen.queryByText('Remove access')).toBeNull();
    await user.click(
      screen.getByRole('button', { name: 'Alice Smith Viewer' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Remove access' }));
    expect(setShare).toHaveBeenCalledWith({
      principal: { workspaceMemberId: 'alice-member' },
      enabled: false,
    });
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
    expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
  });
  it('shows application and owner grants without offering to revoke them', async () => {
    renderSharing({
      sharing: {
        ...sharing,
        shares: [
          {
            id: 'owner',
            principalType: 'WORKSPACE_MEMBER',
            principalId: 'alice-member',
            accessLevel: 'FULL',
            rowCause: 'OWNER',
          },
          {
            id: 'app',
            principalType: 'ROLE',
            principalId: 'sales-role',
            accessLevel: 'READ',
            rowCause: 'APPLICATION',
          },
        ],
      },
    });
    await waitFor(() => expect(screen.getByText('Owner')).toBeVisible());
    expect(screen.getByText('Managed access')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
  });

  it('explains inherited access instead of promising a manual revocation removes it', async () => {
    renderSharing({ sharing: { ...sharing, hasInheritedAccess: true } });
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
      'READ_WRITE',
    ],
    ['Sales', { roleId: 'sales-role' }, 'Editor', 'READ_WRITE'],
    [
      'Alice Smith',
      { workspaceMemberId: 'alice-member' },
      'Full access',
      'FULL',
    ],
    ['Sales', { roleId: 'sales-role' }, 'Full access', 'FULL'],
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
        screen.getByRole('menuitemradio', { name: accessLabel as string }),
      );
      await user.keyboard('{Escape}');
      await user.click(screen.getByText(label as string));
      expect(setShare).toHaveBeenCalledWith({
        principal,
        enabled: true,
        accessLevel,
      });
    },
  );

  it.each([
    [
      'Alice Smith',
      'WORKSPACE_MEMBER',
      'alice-member',
      { workspaceMemberId: 'alice-member' },
    ],
    ['Sales', 'ROLE', 'sales-role', { roleId: 'sales-role' }],
    [
      'Everyone with access to Companies',
      'EVERYONE',
      'everyone',
      { everyone: true },
    ],
  ])(
    'can upgrade and downgrade %s without removing their grant',
    async (label, principalType, principalId, principal) => {
      const user = userEvent.setup();
      const shares = [
        {
          id: 'grant',
          principalType,
          principalId,
          accessLevel: 'READ',
          rowCause: 'MANUAL',
        },
      ];
      const generalAccessLevelOf = (accessLevel: string) =>
        principalType === 'EVERYONE'
          ? accessLevel
          : RecordShareAccessLevel.NONE;
      const view = renderSharing({
        sharing: {
          ...sharing,
          generalAccessLevel: generalAccessLevelOf('READ'),
          shares,
        },
      });
      await user.click(
        screen.getByRole('button', {
          name:
            principalType === 'EVERYONE'
              ? /^Everyone with access to Companies/
              : new RegExp(`^${label}`),
        }),
      );
      await user.click(screen.getByText('Full access'));
      expect(setShare).toHaveBeenLastCalledWith({
        principal,
        enabled: true,
        accessLevel: 'FULL',
      });
      view.unmount();
      renderSharing({
        sharing: {
          ...sharing,
          generalAccessLevel: generalAccessLevelOf('FULL'),
          shares: [{ ...shares[0], accessLevel: 'FULL' }],
        },
      });
      await user.click(
        screen.getByRole('button', {
          name:
            principalType === 'EVERYONE'
              ? /^Everyone with access to Companies/
              : new RegExp(`^${label}`),
        }),
      );
      await user.click(screen.getAllByText('Viewer').at(-1)!);
      expect(setShare).toHaveBeenLastCalledWith({
        principal,
        enabled: true,
        accessLevel: 'READ',
      });
    },
  );

  it('marks the default access of a record open by default and lets owners restrict it', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharing: {
        ...sharing,
        isOpenByDefault: true,
        generalAccessLevel: RecordShareAccessLevel.READ_WRITE,
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
    expect(setShare).toHaveBeenCalledWith({
      principal: { everyone: true },
      enabled: false,
    });
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
        sharing: {
          ...sharing,
          sharingReach,
          shares: [
            {
              id: 'grant',
              principalType: 'WORKSPACE_MEMBER',
              principalId: 'alice-member',
              accessLevel: 'READ',
              rowCause: 'MANUAL',
              canRoleRead: false,
              canRoleUpdate: false,
            },
          ],
        },
      });
      await waitFor(() => expect(screen.getByText(note)).toBeVisible());
    },
  );
});
