import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatChannelMembersDropdownContent } from '@/ai/components/AiChatChannelMembersDropdownContent';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  type AgentChatChannel,
  type AgentChatChannelMember,
  AgentChatChannelMemberRole,
  type AgentChatChannelRole,
  AgentChatChannelVisibility,
} from '~/generated-metadata/graphql';

const addChatChannelMember = jest.fn();
const removeChatChannelMember = jest.fn();
const leaveChatChannel = jest.fn();
const addChatChannelRole = jest.fn();
const removeChatChannelRole = jest.fn();

jest.mock('@/ai/hooks/useChatChannelActions', () => ({
  useChatChannelActions: () => ({
    addChatChannelMember,
    removeChatChannelMember,
    leaveChatChannel,
    addChatChannelRole,
    removeChatChannelRole,
  }),
}));

const SALES_ROLE = { id: 'role-sales', label: 'Sales rep', icon: null };
const ADMIN_ROLE = {
  id: 'role-admin',
  label: 'Workspace admin',
  icon: 'IconUserShield',
};

jest.mock('@/ai/hooks/useChatChannelAssignableRoles', () => ({
  useChatChannelAssignableRoles: () => ({
    assignableRoles: [ADMIN_ROLE, SALES_ROLE],
    loading: false,
  }),
}));

const CHANNEL_ID = 'channel-sales';

const buildMember = (
  id: string,
  userWorkspaceId: string,
  firstName: string,
  lastName: string,
) => ({
  __typename: 'WorkspaceMember' as const,
  id,
  userWorkspaceId,
  userId: `user-${id}`,
  userEmail: `${firstName.toLowerCase()}@twenty.com`,
  name: { firstName, lastName },
  avatarUrl: null,
  colorScheme: 'Light' as const,
  locale: 'en',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
});

const TIM = buildMember('member-tim', 'uw-tim', 'Tim', 'Apple');
const JONY = buildMember('member-jony', 'uw-jony', 'Jony', 'Ive');
const PHIL = buildMember('member-phil', 'uw-phil', 'Phil', 'Schiler');

const CHANNEL: AgentChatChannel = {
  __typename: 'AgentChatChannel',
  id: CHANNEL_ID,
  name: 'Sales',
  description: null,
  visibility: AgentChatChannelVisibility.PUBLIC,
  targetObjectMetadataId: null,
  targetRecordId: null,
  createdByUserWorkspaceId: TIM.userWorkspaceId,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const buildChannelMember = (
  userWorkspaceId: string,
  role: AgentChatChannelMemberRole,
): AgentChatChannelMember => ({
  __typename: 'AgentChatChannelMember',
  id: `channel-member-${userWorkspaceId}`,
  channelId: CHANNEL_ID,
  userWorkspaceId,
  role,
  createdAt: '2026-09-01T00:00:00.000Z',
});

const renderWithStore = (currentMember: typeof TIM) => {
  const store = createStore();

  store.set(currentWorkspaceMembersState.atom, [TIM, JONY, PHIL]);
  store.set(currentWorkspaceMemberState.atom, currentMember);
  store.set(metadataStoreState.atomFamily('agentChatChannels'), {
    current: [CHANNEL],
    draft: [CHANNEL],
    status: 'up-to-date',
  });
  const members = [
    buildChannelMember(TIM.userWorkspaceId, AgentChatChannelMemberRole.ADMIN),
    buildChannelMember(JONY.userWorkspaceId, AgentChatChannelMemberRole.MEMBER),
  ];
  store.set(metadataStoreState.atomFamily('agentChatChannelMembers'), {
    current: members,
    draft: members,
    status: 'up-to-date',
  });
  const channelRoles: AgentChatChannelRole[] = [
    {
      __typename: 'AgentChatChannelRole',
      id: 'channel-role-sales',
      channelId: CHANNEL_ID,
      roleId: SALES_ROLE.id,
      createdAt: '2026-09-01T00:00:00.000Z',
    },
  ];
  store.set(metadataStoreState.atomFamily('agentChatChannelRoles'), {
    current: channelRoles,
    draft: channelRoles,
    status: 'up-to-date',
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </JotaiProvider>
  );

  return render(
    <AiChatChannelMembersDropdownContent
      channelId={CHANNEL_ID}
      onBack={jest.fn()}
    />,
    { wrapper: Wrapper },
  );
};

describe('AiChatChannelMembersDropdownContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets an admin add workspace members and remove non-admin members', async () => {
    const user = userEvent.setup();
    renderWithStore(TIM);

    expect(screen.getByText('Tim Apple')).toBeVisible();
    expect(screen.getByText(/Admin/)).toBeVisible();
    expect(screen.getByText('Add people')).toBeVisible();

    await user.click(screen.getByText('Phil Schiler'));
    expect(addChatChannelMember).toHaveBeenCalledWith({
      channelId: CHANNEL_ID,
      userWorkspaceId: PHIL.userWorkspaceId,
    });

    await user.click(screen.getByRole('button', { name: 'Remove Jony Ive' }));
    expect(removeChatChannelMember).toHaveBeenCalledWith({
      channelId: CHANNEL_ID,
      userWorkspaceId: JONY.userWorkspaceId,
    });
  });

  it('lets an admin grant and revoke roles', async () => {
    const user = userEvent.setup();
    renderWithStore(TIM);

    expect(screen.getByText('Roles')).toBeVisible();
    expect(screen.getByText('Sales rep')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Remove Sales rep' }));
    expect(removeChatChannelRole).toHaveBeenCalledWith({
      channelId: CHANNEL_ID,
      roleId: SALES_ROLE.id,
    });

    await user.click(screen.getByText('Workspace admin'));
    expect(addChatChannelRole).toHaveBeenCalledWith({
      channelId: CHANNEL_ID,
      roleId: ADMIN_ROLE.id,
    });
  });

  it('shows granted roles to members without letting them change them', () => {
    renderWithStore(JONY);

    expect(screen.getByText('Sales rep')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Remove Sales rep' }),
    ).toBeNull();
    expect(screen.queryByText('Give access to a role')).toBeNull();
  });

  it('only lets a member leave', async () => {
    const user = userEvent.setup();
    renderWithStore(JONY);

    expect(screen.queryByText('Add people')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Remove Jony Ive' }),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Leave channel' }));
    expect(leaveChatChannel).toHaveBeenCalledWith({
      channelId: CHANNEL_ID,
      userWorkspaceId: JONY.userWorkspaceId,
    });
  });
});
