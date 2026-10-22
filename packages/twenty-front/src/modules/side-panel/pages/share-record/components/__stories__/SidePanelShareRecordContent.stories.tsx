import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AVATAR_URL_MOCK, ComponentDecorator } from 'twenty-ui/testing';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
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
    setShare.mockClear();
    removeShare.mockClear();
    refetch.mockClear();
    refetch.mockResolvedValue(undefined);
  },
  parameters: { container: { width: 600, height: 700 } },
};

export default meta;
type Story = StoryObj<typeof SidePanelShareRecordContent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const generalAccess = await page.findByRole('button', {
      name: 'Restricted',
    });
    const addPeople = page.getByRole('button', { name: 'Add people or roles' });
    const role = page.getByRole('button', { name: 'Sales Viewer' });
    const recipient = page.getByRole('button', { name: 'Phil Schiler Editor' });
    await expect(generalAccess).toBeVisible();
    await expect(page.getByText('Everyone')).toBeVisible();
    await expect(page.getByText('Roles')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.getByText('You')).toBeVisible();
    await expect(page.getByText('Owner')).toBeVisible();
    await userEvent.tab();
    await expect(addPeople).toHaveFocus();
    await userEvent.tab();
    await expect(generalAccess).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      await page.findByRole('menuitemradio', { name: 'Restricted (default)' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
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
    await userEvent.click(
      await page.findByRole('button', { name: 'Add people or roles' }),
    );
    await waitFor(() =>
      expect(page.getByPlaceholderText('Search people or roles')).toBeVisible(),
    );
    const recipientWithoutAvatar = page.getByRole('button', {
      name: /Jane Austen/,
    });
    await expect(
      await within(recipientWithoutAvatar).findByText('J'),
    ).toBeVisible();
    const recipientWithAvatar = page.getByRole('button', { name: /Jony Ive/ });
    const avatar =
      await within(recipientWithAvatar).findByRole<HTMLImageElement>(
        'presentation',
      );
    await expect(avatar).toBeVisible();
    await waitFor(() => expect(avatar.naturalWidth).toBeGreaterThan(0));
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
    const addPeople = await page.findByRole('button', {
      name: 'Add people or roles',
    });
    await expect(addPeople).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(addPeople);
    await expect(
      page.queryByPlaceholderText('Search people or roles'),
    ).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(addPeople).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      page.queryByPlaceholderText('Search people or roles'),
    ).not.toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
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
