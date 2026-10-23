import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const THREAD_TITLE = 'Qualify the lead';
const THREAD_ACTIVITY_AT = '2026-10-21T09:00:00.000Z';
const INBOX_EVENT_AT = '2026-10-22T09:00:00.000Z';
const SNOOZED_UNTIL = '2026-10-30T09:00:00.000Z';
const SALES_CHANNEL = {
  id: '3d8a1f5c-6b2e-4c9d-8e7f-0a1b2c3d4e5f',
  name: 'Sales',
  icon: 'IconCoins',
  color: 'green',
  position: 1,
  isCustom: true,
  isAccessible: true,
  roleIds: [],
};

const CHAT_OBJECT_METADATA_ITEM = {
  ...getMockObjectMetadataItemOrThrow('note'),
  id: 'chat-object',
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
  fields: [],
  readableFields: [],
  updatableFields: [],
  indexMetadatas: [],
};

type ThreadScope = 'INBOX' | 'SNOOZED' | 'ARCHIVED';

jest.mock('@/ai/hooks/useAiChatThreadRename', () => ({
  useAiChatThreadRename: () => ({
    isRenaming: false,
    draftTitle: '',
    setDraftTitle: jest.fn(),
    startRename: jest.fn(),
    cancelRename: jest.fn(),
    commitRename: jest.fn(),
  }),
}));

jest.mock('@/ai/hooks/useExecuteAgentChatThreadInboxAction', () => ({
  useExecuteAgentChatThreadInboxAction: () => ({
    executeAgentChatThreadInboxAction: jest.fn(),
    isPending: false,
  }),
}));

const renderThread = async ({
  scope = 'SNOOZED',
  hasAiPermission = true,
  isInboxEnabled = true,
  isDeleted = false,
  channelStatus,
  pathname = '/inbox',
  onDetach,
}: {
  scope?: ThreadScope;
  hasAiPermission?: boolean;
  isInboxEnabled?: boolean;
  isDeleted?: boolean;
  channelStatus?: AgentChatChannelThreadStatus;
  pathname?: string;
  onDetach?: () => void;
} = {}) => {
  const thread: AgentChatThreadRecord = {
    __typename: 'AgentChatThread',
    id: THREAD_ID,
    title: THREAD_TITLE,
    createdAt: THREAD_ACTIVITY_AT,
    updatedAt: THREAD_ACTIVITY_AT,
    lastActivityAt: THREAD_ACTIVITY_AT,
    deletedAt: isDeleted ? INBOX_EVENT_AT : null,
    lastMessageText: 'Prepare the next step',
    workspaceMemberId: mockedWorkspaceMemberData.id,
    channelId: isDefined(channelStatus) ? SALES_CHANNEL.id : null,
    channelArchivedAt:
      isDefined(channelStatus) &&
      channelStatus !== AgentChatChannelThreadStatus.OPEN
        ? INBOX_EVENT_AT
        : null,
    channelSnoozedUntil:
      channelStatus === AgentChatChannelThreadStatus.SNOOZED
        ? SNOOZED_UNTIL
        : null,
  };
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [
      ...getTestEnrichedObjectMetadataItemsMock(),
      CHAT_OBJECT_METADATA_ITEM,
    ],
    onInitializeJotaiStore: (store) => {
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags: [
          {
            key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
            value: isInboxEnabled,
          },
        ],
      });
      store.set(currentUserWorkspaceState.atom, {
        ...mockedUserData.currentUserWorkspace,
        permissionFlags: hasAiPermission ? [PermissionFlagType.AI] : [],
      });
      store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
      store.set(currentWorkspaceMembersState.atom, [mockedWorkspaceMemberData]);
      store.set(
        agentChatChannelsState.atom,
        isDefined(channelStatus) ? [SALES_CHANNEL] : [],
      );
      store.set(
        agentChatChannelViewState.atom,
        isDefined(channelStatus)
          ? {
              channelId: SALES_CHANNEL.id,
              channelStatus,
              assignment: AgentChatChannelAssignmentFilter.ANY,
            }
          : null,
      );
      setAgentChatThreadPermissions(store, THREAD_ID, {
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canSoftDelete: true,
      });
      store.set(recordStoreFamilyState.atomFamily(THREAD_ID), thread);
      store.set(agentChatThreadParticipantsState.atom, {
        [THREAD_ID]: {
          __typename: 'AgentChatThreadParticipant',
          id: '20202020-0000-4000-8000-0000000000bb',
          threadId: THREAD_ID,
          isSubscribed: true,
          archivedAt: scope === 'INBOX' ? null : INBOX_EVENT_AT,
          snoozedUntil: scope === 'SNOOZED' ? SNOOZED_UNTIL : null,
          lastReadAt: THREAD_ACTIVITY_AT,
          updatedAt: INBOX_EVENT_AT,
        },
      });
    },
  });

  render(
    <Wrapper>
      <MemoryRouter initialEntries={[pathname]}>
        <I18nProvider i18n={i18n}>
          <AiChatThreadListItem
            thread={thread}
            isSelected={false}
            onClick={jest.fn()}
            onDetach={onDetach}
          />
        </I18nProvider>
      </MemoryRouter>
    </Wrapper>,
  );

  await screen.findByRole('group', { name: THREAD_TITLE });
};

describe('AiChatThreadListItem action availability', () => {
  beforeAll(() => {
    i18n.load({ [SOURCE_LOCALE]: messages });
    i18n.activate(SOURCE_LOCALE);
  });

  it.each([
    {
      reason: 'AI permission is missing',
      scope: 'SNOOZED',
      hasAiPermission: false,
    },
    {
      reason: 'the inbox flag is disabled',
      scope: 'ARCHIVED',
      isInboxEnabled: false,
    },
  ] satisfies {
    reason: string;
    scope: ThreadScope;
    hasAiPermission?: boolean;
    isInboxEnabled?: boolean;
  }[])('keeps More when $reason', async (options) => {
    await renderThread(options);

    expect(
      screen.getByRole('button', { name: 'Chat actions' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Change' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Wake now' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reopen' }),
    ).not.toBeInTheDocument();
  });

  it('shows Change and Wake now without More for an available snoozed chat', async () => {
    await renderThread();

    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Wake now' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Chat actions' }),
    ).not.toBeInTheDocument();
  });

  it('shows Reopen without More for an available archived chat', async () => {
    await renderThread({ scope: 'ARCHIVED' });

    expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Chat actions' }),
    ).not.toBeInTheDocument();
  });

  it('keeps More for a linked snoozed chat with a Detach action', async () => {
    await renderThread({ onDetach: jest.fn() });

    expect(
      screen.getByRole('button', { name: 'Chat actions' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Wake now' }),
    ).toBeInTheDocument();
  });

  it('keeps More without triage actions for a deleted archived chat', async () => {
    await renderThread({ scope: 'ARCHIVED', isDeleted: true });

    expect(
      screen.getByRole('button', { name: 'Chat actions' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reopen' }),
    ).not.toBeInTheDocument();
  });

  it('shows open channel actions when the personal copy is snoozed', async () => {
    await renderThread({
      scope: 'SNOOZED',
      channelStatus: AgentChatChannelThreadStatus.OPEN,
    });

    expect(screen.getByRole('button', { name: 'Snooze' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Chat actions' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Wake now' }),
    ).not.toBeInTheDocument();
  });

  it('shows done channel actions when the personal copy is open', async () => {
    await renderThread({
      scope: 'INBOX',
      channelStatus: AgentChatChannelThreadStatus.DONE,
    });

    expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Chat actions' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Snooze' }),
    ).not.toBeInTheDocument();
  });

  it('uses the personal copy outside the inbox despite a selected done channel', async () => {
    await renderThread({
      scope: 'SNOOZED',
      channelStatus: AgentChatChannelThreadStatus.DONE,
      pathname: '/companies',
    });

    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Wake now' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reopen' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Chat actions' }),
    ).not.toBeInTheDocument();
  });
});
