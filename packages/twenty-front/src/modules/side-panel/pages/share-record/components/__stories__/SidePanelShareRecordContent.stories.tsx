import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SidePanelShareRecordContent } from '@/side-panel/pages/share-record/components/SidePanelShareRecordContent';
import {
  ObjectSharingReach,
  RecordShareAccessLevel,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const setShare = fn();
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
];

const SHARING = {
  isEnabled: true,
  hasInheritedAccess: false,
  isOpenByDefault: false,
  generalAccessLevel: RecordShareAccessLevel.NONE,
  sharingReach: ObjectSharingReach.WORKSPACE,
  viewerAccessLevel: RecordShareAccessLevel.FULL,
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
      rowCause: RecordShareRowCause.OWNER,
      accessLevel: RecordShareAccessLevel.FULL,
      canRoleRead: true,
      canRoleUpdate: true,
    },
    {
      id: 'member-grant',
      principalId: 'member',
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      rowCause: RecordShareRowCause.MANUAL,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      canRoleRead: true,
      canRoleUpdate: true,
    },
    {
      id: 'role-grant',
      principalId: 'sales',
      principalType: RecordSharePrincipalType.ROLE,
      rowCause: RecordShareRowCause.MANUAL,
      accessLevel: RecordShareAccessLevel.READ,
      canRoleRead: true,
      canRoleUpdate: true,
    },
  ],
  roles: [{ id: 'sales', label: 'Sales' }],
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
    sharingState: {
      sharing: SHARING,
      loading: false,
      error: undefined,
      saving: false,
      setShare,
      refetch,
    },
  },
  parameters: { container: { width: 600, height: 700 } },
};

export default meta;
type Story = StoryObj<typeof SidePanelShareRecordContent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(
      await page.findByRole('button', { name: 'Restricted' }),
    ).toBeVisible();
    await expect(page.getByText('You')).toBeVisible();
    await expect(page.getByText('Owner')).toBeVisible();
    await userEvent.click(
      page.getByRole('button', { name: 'Phil Schiler Editor' }),
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Full access' }),
    );
    await waitFor(() =>
      expect(setShare).toHaveBeenCalledWith({
        principal: { workspaceMemberId: 'member' },
        enabled: true,
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
    await expect(
      await page.findByPlaceholderText('Search people or roles'),
    ).toBeVisible();
    await expect(page.getByText('Jane Austen')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: {
    sharingState: {
      sharing: {
        ...SHARING,
        viewerAccessLevel: RecordShareAccessLevel.READ,
      },
      loading: false,
      error: undefined,
      saving: false,
      setShare,
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
    await expect(page.queryByText('General access')).not.toBeInTheDocument();
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
      setShare,
      refetch,
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole('alert')).toHaveTextContent(
      'Sharing settings could not be loaded.',
    );
    await expect(page.getByText('Try again')).toBeVisible();
  },
};
