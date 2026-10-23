import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
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
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
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
  isLoading = false,
  error,
}: {
  sharingOverrides?: Partial<RecordSharingFieldsFragment>;
  sharingReach?: ObjectSharingReach;
  isLoading?: boolean;
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
        loading: isLoading,
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
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      displayName: 'Acme',
    });
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      {
        id: 'alice-member',
        name: { firstName: 'Alice', lastName: 'Smith' },
        userEmail: 'alice@example.com',
      } as never,
    ]);
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

  it('keeps loaded sharing controls available during a refresh', async () => {
    renderSharing({ isLoading: true });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Restricted' })).toBeVisible(),
    );
    expect(
      screen.getByRole('searchbox', { name: 'Add people or everyone' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('status', { name: 'Loading sharing settings' }),
    ).toBeNull();
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
      screen.queryByRole('searchbox', { name: 'Add people or everyone' }),
    ).toBeNull();
    expect(screen.getByText('Copy link')).toBeVisible();
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
      ObjectSharingReach.WORKSPACE,
      "People you add get this record even if their role can't access Companies. Field permissions still apply.",
    ],
    [ObjectSharingReach.ROLE_ACCESS, 'Role and field permissions still apply.'],
  ])(
    'tells managers what adding people grants when sharing reach is %s',
    async (sharingReach, notice) => {
      renderSharing({ sharingReach });
      await waitFor(() => expect(screen.getByText(notice)).toBeVisible());
    },
  );

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

  it('explains that records of an object without record sharing follow roles', async () => {
    renderSharing({
      sharingOverrides: {
        sharingMode: RecordSharingMode.ROLE_ONLY,
        canManageSharing: false,
        generalAccessLevel: null,
        defaultGeneralAccessLevel: null,
        roles: [],
      },
    });
    await waitFor(() =>
      expect(
        screen.getByText(
          'Access to Companies is set by roles, not record by record.',
        ),
      ).toBeVisible(),
    );
    expect(screen.queryByText(/Only the creator of this record/)).toBeNull();
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
