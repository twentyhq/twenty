import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useState } from 'react';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { AVATAR_URL_MOCK, ComponentDecorator } from 'twenty-ui/testing';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SidePanelShareRecordContent } from '@/side-panel/pages/share-record/components/SidePanelShareRecordContent';
import {
  ObjectSharingReach,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RecordSharingMode,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const setGeneralAccess = fn();
const setShare = fn();
const removeShare = fn();
const refetch = fn().mockResolvedValue(undefined);

const MEMBERS = [
  {
    id: 'owner',
    name: { firstName: 'Alex', lastName: 'Morgan' },
    userEmail: 'alex@example.com',
    userId: 'owner-user',
  },
  {
    id: 'member',
    name: { firstName: 'Phil', lastName: 'Schiler' },
    userEmail: 'phil@example.com',
    userId: 'member-user',
  },
  {
    id: 'invite',
    name: { firstName: 'Jane', lastName: 'Austen' },
    userEmail: 'jane.austen@example.com',
    userId: 'invite-user',
  },
  {
    id: 'invite-with-avatar',
    name: { firstName: 'Jony', lastName: 'Ive' },
    userEmail: 'jony@example.com',
    userId: 'invite-with-avatar-user',
    avatarUrl: AVATAR_URL_MOCK,
  },
];

const SHARING = {
  sharingMode: RecordSharingMode.PRIVATE,
  canManageSharing: true,
  generalAccessLevel: RecordShareAccessLevel.NONE,
  defaultGeneralAccessLevel: RecordShareAccessLevel.NONE,
  hasManagedGeneralAccess: false,
  permissions: {
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canSoftDelete: false,
  },
  shares: [
    {
      id: 'owner-grant',
      principalId: 'owner',
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      principalRoleId: 'sales',
      rowCause: RecordShareRowCause.OWNER,
      accessLevel: RecordShareAccessLevel.FULL,
    },
    {
      id: 'member-grant',
      principalId: 'member',
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      principalRoleId: 'sales',
      rowCause: RecordShareRowCause.MANUAL,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    },
    {
      id: 'role-grant',
      principalId: 'sales',
      principalType: RecordSharePrincipalType.ROLE,
      principalRoleId: null,
      rowCause: RecordShareRowCause.MANUAL,
      accessLevel: RecordShareAccessLevel.READ,
    },
  ],
  roles: [{ id: 'sales', label: 'Sales', canRead: true, canUpdate: true }],
};

const StyledSidePanel = styled.div`
  height: 600px;
  width: 400px;
`;

const SidePanelStoryProviders = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => {
    const store = createStore();
    store.set(currentWorkspaceMembersState.atom, MEMBERS);
    store.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      displayName: 'Acme',
    });
    store.set(currentWorkspaceMemberState.atom, {
      ...MEMBERS[0],
      colorScheme: 'Light',
      locale: 'en',
    });
    return store;
  });

  return (
    <Provider store={store}>
      <StyledSidePanel>{children}</StyledSidePanel>
    </Provider>
  );
};

const meta: Meta<typeof SidePanelShareRecordContent> = {
  title: 'Modules/SidePanel/ShareRecord/SidePanelShareRecordContent',
  component: SidePanelShareRecordContent,
  decorators: [
    (Story) => (
      <SidePanelStoryProviders>
        <Story />
      </SidePanelStoryProviders>
    ),
    ComponentDecorator,
    MemoryRouterDecorator,
    ToastDecorator,
  ],
  args: {
    recordUrl: 'https://example.com/chat/shared-chat',
    objectLabelPlural: 'Chats',
    sharingReach: ObjectSharingReach.WORKSPACE,
    sharingState: {
      sharing: SHARING,
      loading: false,
      error: undefined,
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  beforeEach: () => {
    setGeneralAccess.mockClear();
    setGeneralAccess.mockResolvedValue(SHARING);
    setShare.mockClear();
    setShare.mockResolvedValue(SHARING);
    removeShare.mockClear();
    removeShare.mockResolvedValue(SHARING);
    refetch.mockClear();
    refetch.mockResolvedValue(undefined);
  },
  parameters: { container: { width: 600, height: 700 } },
};

export default meta;
type Story = StoryObj<typeof SidePanelShareRecordContent>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    const generalAccess = await page.findByRole('button', {
      name: 'Restricted',
    });
    const footer = page
      .getByRole('button', { name: 'Copy link' })
      .closest('[data-variant="compact"]');
    await expect(footer?.getBoundingClientRect().height).toBe(40);
    const addPeople = page.getByPlaceholderText('Add people or everyone');
    const role = page.getByRole('button', { name: 'Sales Viewer' });
    const recipient = page.getByRole('button', { name: 'Phil Schiler Editor' });
    await expect(generalAccess).toBeVisible();
    await expect(page.getByText('Everyone')).toBeVisible();
    await expect(page.getByText('Roles')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.getByText('You')).toBeVisible();
    await expect(page.getByText('Owner')).toBeVisible();
    await userEvent.click(addPeople);
    await expect(addPeople).toHaveFocus();
    await userEvent.tab();
    await expect(generalAccess).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const restrictedOption = await page.findByRole('menuitemradio', {
      name: 'Restricted (default)',
    });
    await expect(restrictedOption).toBeVisible();
    const restrictedLabel = within(restrictedOption).getByText(
      'Restricted (default)',
    );
    await canvasElement.ownerDocument.fonts.ready;
    await expect(restrictedLabel.scrollWidth).toBeLessThanOrEqual(
      restrictedLabel.clientWidth,
    );
    const generalAccessHeading = page.getByText(
      `Everyone with access to ${args.objectLabelPlural}`,
    );
    const headingRange = canvasElement.ownerDocument.createRange();
    headingRange.selectNodeContents(generalAccessHeading);
    await expect(headingRange.getClientRects()).toHaveLength(1);
    await expect(
      page.queryByRole('menuitemradio', { name: 'Full access' }),
    ).not.toBeInTheDocument();
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Viewer' }));
    await waitFor(() =>
      expect(setGeneralAccess).toHaveBeenLastCalledWith(
        RecordShareAccessLevel.READ,
      ),
    );
    await expect(generalAccess).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Editor' }),
    );
    await waitFor(() =>
      expect(setGeneralAccess).toHaveBeenLastCalledWith(
        RecordShareAccessLevel.READ_WRITE,
      ),
    );
    await expect(generalAccess).toHaveFocus();
    await userEvent.tab();
    await expect(role).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Editor' }),
    );
    await waitFor(() =>
      expect(setShare).toHaveBeenCalledWith({
        principal: { roleId: 'sales' },
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      }),
    );
    await expect(role).toHaveFocus();
    await userEvent.tab();
    await expect(recipient).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Full access' }),
    );
    await waitFor(() =>
      expect(setShare).toHaveBeenCalledWith({
        principal: { workspaceMemberId: 'member' },
        accessLevel: RecordShareAccessLevel.FULL,
      }),
    );
  },
};

export const AddPeople: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const search = await page.findByPlaceholderText('Add people or everyone');
    await userEvent.type(search, 'No matching recipient');
    await expect(page.getByText('No matching people or roles')).toBeVisible();
    await expect(page.queryByRole('checkbox')).not.toBeInTheDocument();
    await expect(page.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await userEvent.clear(search);
    await expect(
      page.queryByText('No matching people or roles'),
    ).not.toBeInTheDocument();
    await userEvent.type(search, 'phil@example.com');
    await expect(page.getByText('Have access')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Phil Schiler Editor' }),
    ).toBeVisible();
    await expect(
      page.queryByRole('checkbox', { name: /Jane Austen/ }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await expect(page.queryByRole('menu')).not.toBeInTheDocument();
    await expect(search).toHaveFocus();
    await userEvent.clear(search);
    await userEvent.type(search, 'j');
    await expect(page.getByText('Not shared with')).toBeVisible();
    const recipientWithoutAvatar = page
      .getByRole('checkbox', {
        name: /Jane Austen/,
      })
      .closest('label');

    if (!isDefined(recipientWithoutAvatar)) {
      throw new Error('Jane Austen recipient row is missing');
    }

    await expect(
      await within(recipientWithoutAvatar).findByText('J'),
    ).toBeVisible();
    const recipientWithAvatar = page
      .getByRole('checkbox', { name: /Jony Ive/ })
      .closest('label');

    if (!isDefined(recipientWithAvatar)) {
      throw new Error('Jony Ive recipient row is missing');
    }

    const avatar =
      await within(recipientWithAvatar).findByRole<HTMLImageElement>(
        'presentation',
      );
    await expect(avatar).toBeVisible();
    await waitFor(() => expect(avatar.naturalWidth).toBeGreaterThan(0));
  },
};

export const ChangeAccessWithoutMovingRecipients: Story = {
  args: {
    sharingState: {
      sharing: {
        ...SHARING,
        shares: [
          SHARING.shares[0],
          {
            ...SHARING.shares[1],
            id: 'jane-grant',
            principalId: 'invite',
          },
          ...SHARING.shares.slice(1),
        ],
      },
      loading: false,
      error: undefined,
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  render: (args) => {
    const [sharing, setSharing] = useState(args.sharingState.sharing);
    const handleSetShare = async (
      input: Parameters<typeof args.sharingState.setShare>[0],
    ) => {
      const result = await args.sharingState.setShare(input);

      if (isDefined(result)) {
        setSharing(result);
      }

      return result;
    };

    return (
      <SidePanelShareRecordContent
        recordUrl={args.recordUrl}
        objectLabelPlural={args.objectLabelPlural}
        sharingReach={args.sharingReach}
        sharingState={{
          ...args.sharingState,
          sharing,
          setShare: handleSetShare,
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const jane = await page.findByRole('button', {
      name: 'Jane Austen Editor',
    });
    const phil = page.getByRole('button', { name: 'Phil Schiler Editor' });
    const janePosition = jane.getBoundingClientRect().top;
    const philPosition = phil.getBoundingClientRect().top;
    setShare.mockResolvedValueOnce({
      ...SHARING,
      shares: [
        ...SHARING.shares,
        {
          ...SHARING.shares[1],
          id: 'updated-jane-grant',
          principalId: 'invite',
          accessLevel: RecordShareAccessLevel.FULL,
        },
      ],
    });

    await userEvent.click(jane);
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Full access' }),
    );
    const updatedJane = await page.findByRole('button', {
      name: 'Jane Austen Full access',
    });

    await expect(updatedJane.getBoundingClientRect().top).toBe(janePosition);
    await expect(phil.getBoundingClientRect().top).toBe(philPosition);
    await expect(setShare).toHaveBeenCalledWith({
      principal: { workspaceMemberId: 'invite' },
      accessLevel: RecordShareAccessLevel.FULL,
    });
  },
};

export const InvitePeople: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const search = await page.findByPlaceholderText('Add people or everyone');
    await userEvent.type(search, 'j');
    await userEvent.tab();
    await expect(
      page.getByRole('button', { name: 'Invite as Viewer' }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(
      page.getByRole('checkbox', { name: /Jane Austen/ }),
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(
      page.getByRole('checkbox', { name: /Jane Austen/ }),
    ).toBeChecked();
    await expect(search).toHaveFocus();
    await userEvent.click(page.getByRole('checkbox', { name: /Jony Ive/ }));
    await expect(page.getByRole('button', { name: 'Invite 2' })).toBeEnabled();
    await expect(setShare).not.toHaveBeenCalled();
    await userEvent.click(page.getByRole('button', { name: 'Invite 2' }));
    await waitFor(() => expect(setShare).toHaveBeenCalledTimes(2));
    await expect(setShare).toHaveBeenNthCalledWith(1, {
      principal: { workspaceMemberId: 'invite' },
      accessLevel: RecordShareAccessLevel.READ,
    });
    await expect(setShare).toHaveBeenNthCalledWith(2, {
      principal: { workspaceMemberId: 'invite-with-avatar' },
      accessLevel: RecordShareAccessLevel.READ,
    });
    await waitFor(() =>
      expect(page.getByRole('button', { name: 'Invite' })).toBeDisabled(),
    );
    await expect(search).toHaveValue('');
    await expect(page.getByText('Everyone')).toBeVisible();
    await expect(page.getByText('Roles')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.queryByText('Selected')).not.toBeInTheDocument();
    await expect(page.queryByText('Not shared with')).not.toBeInTheDocument();
    await expect(page.queryByRole('checkbox')).not.toBeInTheDocument();
    await expect(setGeneralAccess).not.toHaveBeenCalled();
  },
};

export const InviteEveryone: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(
      await page.findByPlaceholderText('Add people or everyone'),
      'Everyone',
    );
    await userEvent.click(
      page.getByRole('checkbox', { name: /Everyone with access to Chats/ }),
    );
    await userEvent.click(
      page.getByRole('button', { name: 'Invite as Viewer' }),
    );
    await expect(
      page.queryByRole('menuitemradio', { name: 'Full access' }),
    ).not.toBeInTheDocument();
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Editor' }));
    await expect(setGeneralAccess).not.toHaveBeenCalled();
    await userEvent.click(page.getByRole('button', { name: 'Invite 1' }));
    await waitFor(() =>
      expect(setGeneralAccess).toHaveBeenCalledWith(
        RecordShareAccessLevel.READ_WRITE,
      ),
    );
    await expect(setShare).not.toHaveBeenCalled();
  },
};

export const InviteRole: Story = {
  args: {
    sharingState: {
      sharing: {
        ...SHARING,
        shares: SHARING.shares.filter(
          (share) => share.principalType !== RecordSharePrincipalType.ROLE,
        ),
      },
      loading: false,
      error: undefined,
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(
      await page.findByPlaceholderText('Add people or everyone'),
      'sales',
    );
    await userEvent.click(page.getByRole('checkbox', { name: 'Sales' }));
    await expect(page.getByRole('checkbox', { name: 'Sales' })).toBeChecked();
    await expect(setShare).not.toHaveBeenCalled();
    await userEvent.click(
      page.getByRole('button', { name: 'Invite as Viewer' }),
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Full access' }),
    );
    await userEvent.click(page.getByRole('button', { name: 'Invite 1' }));
    await waitFor(() => expect(setShare).toHaveBeenCalledTimes(1));
    await expect(setShare).toHaveBeenCalledWith({
      principal: { roleId: 'sales' },
      accessLevel: RecordShareAccessLevel.FULL,
    });
    await expect(setGeneralAccess).not.toHaveBeenCalled();
  },
};

export const DefaultGeneralAccess: Story = {
  args: {
    sharingState: {
      sharing: {
        ...SHARING,
        sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
        generalAccessLevel: RecordShareAccessLevel.READ_WRITE,
        defaultGeneralAccessLevel: RecordShareAccessLevel.READ_WRITE,
      },
      loading: false,
      error: undefined,
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const generalAccess = await page.findByRole('button', {
      name: 'Everyone with access to Chats Editor',
    });
    await userEvent.click(generalAccess);
    await expect(
      await page.findByRole('menuitemradio', { name: 'Editor (default)' }),
    ).toBeVisible();
    await expect(
      page.queryByRole('menuitemradio', { name: 'Full access' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'Restricted' }),
    );
    await waitFor(() =>
      expect(setGeneralAccess).toHaveBeenLastCalledWith(
        RecordShareAccessLevel.NONE,
      ),
    );
    await userEvent.click(generalAccess);
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Viewer' }),
    );
    await waitFor(() =>
      expect(setGeneralAccess).toHaveBeenLastCalledWith(
        RecordShareAccessLevel.READ,
      ),
    );
    await expect(
      page.getByRole('button', { name: 'Phil Schiler Editor' }),
    ).toBeVisible();
    await expect(setShare).not.toHaveBeenCalled();
    await expect(removeShare).not.toHaveBeenCalled();
  },
};

export const RetainFailedInvitations: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    setShare.mockResolvedValueOnce(undefined);
    const search = await page.findByPlaceholderText('Add people or everyone');
    await userEvent.type(search, 'j');
    await userEvent.click(page.getByRole('checkbox', { name: /Jane Austen/ }));
    await userEvent.click(page.getByRole('checkbox', { name: /Jony Ive/ }));
    await userEvent.click(page.getByRole('button', { name: 'Invite 2' }));
    await waitFor(() => expect(setShare).toHaveBeenCalledTimes(2));
    await expect(
      await page.findByRole('checkbox', { name: /Jane Austen/ }),
    ).toBeChecked();
    await expect(
      page.queryByRole('checkbox', { name: /Jony Ive/, checked: true }),
    ).not.toBeInTheDocument();
    await expect(page.getByRole('button', { name: 'Invite 1' })).toBeEnabled();
    await expect(setShare).toHaveBeenCalledTimes(2);
    await expect(search).toHaveValue('j');
    await userEvent.click(page.getByRole('button', { name: 'Invite 1' }));
    await waitFor(() => expect(search).toHaveValue(''));
    await expect(setShare).toHaveBeenCalledTimes(3);
    await expect(setShare).toHaveBeenLastCalledWith({
      principal: { workspaceMemberId: 'invite' },
      accessLevel: RecordShareAccessLevel.READ,
    });
    await expect(page.getByText('Everyone')).toBeVisible();
    await expect(page.queryByText('Selected')).not.toBeInTheDocument();
    await expect(page.getByRole('button', { name: 'Invite' })).toBeDisabled();
  },
};

export const Loading: Story = {
  args: {
    sharingState: {
      sharing: undefined,
      loading: true,
      error: undefined,
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const loading = await page.findByRole('status', {
      name: 'Loading sharing settings',
    });

    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(page.queryByRole('searchbox')).not.toBeInTheDocument();
    await expect(
      page.queryByRole('button', { name: /^Invite/ }),
    ).not.toBeInTheDocument();
    const copyLink = page.getByRole('button', { name: 'Copy link' });
    await expect(copyLink).toBeVisible();
    const footer = copyLink.closest('[data-variant="compact"]');
    await expect(footer?.getBoundingClientRect().height).toBe(40);
    await expect(setShare).not.toHaveBeenCalled();
    await expect(setGeneralAccess).not.toHaveBeenCalled();
  },
};

export const Saving: Story = {
  args: {
    sharingState: {
      sharing: SHARING,
      loading: false,
      error: undefined,
      saving: true,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const addPeople = await page.findByPlaceholderText(
      'Add people or everyone',
    );
    await expect(addPeople).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await userEvent.type(addPeople, 'Jane');
    await expect(addPeople).toHaveValue('');
    for (const name of ['Restricted', 'Sales Viewer', 'Phil Schiler Editor']) {
      const row = page.getByRole('button', { name });
      await expect(row).toHaveAttribute('aria-disabled', 'true');
      await expect(
        row.querySelector('.tabler-icon-chevron-right'),
      ).toBeVisible();
      await userEvent.click(row);
      row.focus();
      await userEvent.keyboard('{Enter} {ArrowDown}');
      await expect(page.queryByRole('menu')).not.toBeInTheDocument();
    }
    await expect(setShare).not.toHaveBeenCalled();
    await expect(setGeneralAccess).not.toHaveBeenCalled();
    await expect(removeShare).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: {
    sharingState: {
      sharing: {
        ...SHARING,
        canManageSharing: false,
        shares: [],
        roles: [],
      },
      loading: false,
      error: undefined,
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(
      await page.findByText(
        'Only the creator of this record and people with full access to it can change who has access.',
      ),
    ).toBeVisible();
    await expect(page.queryByText('Everyone')).not.toBeInTheDocument();
    await expect(page.queryByText('Roles')).not.toBeInTheDocument();
    await expect(page.queryByText('Users')).not.toBeInTheDocument();
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible();
    const writeText = spyOn(
      navigator.clipboard,
      'writeText',
    ).mockResolvedValue();

    try {
      await userEvent.click(page.getByRole('button', { name: 'Copy link' }));
      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith(args.recordUrl),
      );
    } finally {
      writeText.mockRestore();
    }
  },
};

export const LoadError: Story = {
  args: {
    sharingState: {
      sharing: undefined,
      loading: false,
      error: new Error('Sharing unavailable'),
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole('alert')).toHaveTextContent(
      'Sharing settings could not be loaded.',
    );
    const retry = page.getByRole('button', { name: 'Try again' });
    await userEvent.tab();
    await expect(retry).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(refetch).toHaveBeenCalledTimes(1);
    await userEvent.click(retry);
    await expect(refetch).toHaveBeenCalledTimes(2);
  },
};

export const ManagedAccess: Story = {
  args: {
    sharingState: {
      sharing: {
        ...SHARING,
        hasManagedGeneralAccess: true,
        shares: SHARING.shares.map((share) =>
          share.principalType === RecordSharePrincipalType.ROLE
            ? { ...share, rowCause: RecordShareRowCause.APPLICATION }
            : share,
        ),
      },
      loading: false,
      error: undefined,
      saving: false,
      setGeneralAccess,
      setShare,
      removeShare,
      refetch,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByText('Owner')).toBeVisible();
    await expect(page.getByText('Managed access')).toBeVisible();
    await expect(
      page.getByText('Workspace access is also managed by an application.'),
    ).toBeVisible();
    await expect(
      page.queryByRole('button', { name: /^Sales/ }),
    ).not.toBeInTheDocument();
    await expect(
      page.queryByRole('button', { name: /^You/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      page.getByRole('button', { name: 'Phil Schiler Editor' }),
    );
    await userEvent.click(
      await page.findByRole('menuitem', { name: 'Remove access' }),
    );
    await waitFor(() =>
      expect(removeShare).toHaveBeenCalledWith({
        principal: { workspaceMemberId: 'member' },
      }),
    );
    await expect(setShare).not.toHaveBeenCalled();
  },
};
