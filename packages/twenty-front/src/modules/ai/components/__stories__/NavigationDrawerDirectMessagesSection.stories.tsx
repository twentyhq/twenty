import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isArray } from '@sniptt/guards';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { graphql, HttpResponse } from 'msw';
import { useLocation } from 'react-router-dom';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';

import { DirectMessagePresentationExample } from '@/ai/components/__stories__/DirectMessagePresentationExample';
import { OpenDirectMessageButton } from '@/ai/components/OpenDirectMessageButton';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  type GetRecordPermissionsQuery,
  type GetRecordPermissionsQueryVariables,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const DIRECT_MESSAGE_THREAD_ID = '20202020-0000-4000-8000-000000000041';
const DIRECT_MESSAGE_PEER_ID = '20202020-0000-4000-8000-000000000042';
const openDirectMessageRequest = fn();

const DirectMessageRouteExample = () => {
  const { pathname } = useLocation();

  return (
    <>
      <OpenDirectMessageButton />
      <Text>{pathname}</Text>
    </>
  );
};

const meta = {
  title: 'Modules/AI/NavigationDrawerDirectMessagesSection',
  component: DirectMessagePresentationExample,
  decorators: [ComponentDecorator, MemoryRouterDecorator],
  args: {
    onSelectThread: fn(),
    onSelectMember: fn(),
  },
} satisfies Meta<typeof DirectMessagePresentationExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SidebarSelectionAndCollapse: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const anna = canvas.getByRole('button', { name: 'Anna' });
    const felix = canvas.getByRole('button', { name: /Felix\s*, unread/ });
    const sectionTitle = canvas.getByText('Direct messages');

    await expect(anna).toHaveAttribute('aria-current', 'true');
    await expect(
      canvas.getByRole('button', { name: /Alice\s*, unread/ }),
    ).toBeVisible();

    felix.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelectThread).toHaveBeenCalledTimes(1);
    await expect(args.onSelectThread).toHaveBeenCalledWith('dm-felix');
    await expect(felix).toHaveAttribute('aria-current', 'true');
    await expect(anna).not.toHaveAttribute('aria-current');

    await userEvent.click(sectionTitle);
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Anna' }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(sectionTitle);
    await expect(
      await canvas.findByRole('button', { name: /Felix\s*, unread/ }),
    ).toHaveAttribute('aria-current', 'true');
    await expect(args.onSelectThread).toHaveBeenCalledTimes(1);
  },
};

export const ShowMoreDirectMessages: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('button', { name: 'Lucas' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Show more' }));
    await expect(
      await canvas.findByRole('button', { name: 'Lucas' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Former member' }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Show less' }));
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Lucas' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const Presence: Story = {
  args: { onlineWorkspaceMemberIds: ['anna', 'felix', 'alice'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findAllByRole('img', { name: 'Online' }),
    ).toHaveLength(3);
    await expect(
      canvas.getAllByRole('img', { name: 'Offline' }).length,
    ).toBeGreaterThan(0);
  },
};

export const SearchAndKeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'New direct message' });

    await expect(trigger).toBeVisible();
    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await expect(
      body.getByRole('dialog', { name: 'New direct message' }),
    ).toBeVisible();
    await waitFor(() => expect(search).toHaveFocus());
    await expect(
      body.queryByRole('option', { name: /Raphael/ }),
    ).not.toBeInTheDocument();

    await userEvent.type(search, 'raphael');
    await expect(body.getByRole('status')).toHaveTextContent(
      'No members found',
    );
    await userEvent.clear(search);

    await userEvent.type(search, 'ali');
    await expect(body.getAllByRole('option')).toHaveLength(1);
    await expect(body.getByRole('option', { name: /Alice/ })).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onSelectMember).toHaveBeenCalledTimes(1);
    await expect(args.onSelectMember).toHaveBeenCalledWith('alice');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'New direct message' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    const reopenedSearch = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await waitFor(() => expect(reopenedSearch).toHaveFocus());
    await expect(reopenedSearch).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'New direct message' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onSelectMember).toHaveBeenCalledTimes(1);
  },
};

export const LoadingMembers: Story = {
  args: { memberState: 'loading' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'New direct message' }),
    );

    await expect(await body.findByRole('status')).toHaveTextContent(
      'Loading members',
    );
    await expect(body.queryByRole('option')).not.toBeInTheDocument();
  },
};

export const RefreshingMembersDisablesStaleRows: Story = {
  args: { memberState: 'refreshing' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'New direct message' }),
    );
    const search = await body.findByRole('searchbox', {
      name: 'Search members',
    });
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.type(search, 'anna');
    await expect(body.getByRole('option', { name: /Anna/ })).toBeDisabled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelectMember).not.toHaveBeenCalled();
  },
};

export const OpenMemberConversation: Story = {
  render: () => <DirectMessageRouteExample />,
  decorators: [ToastDecorator, RootDecorator],
  beforeEach: () => {
    openDirectMessageRequest.mockClear();
    const noteMetadata = getMockObjectMetadataItemOrThrow(
      StandardObjectNameSingular.Note,
    );
    const chatFields = noteMetadata.fields.filter((field) =>
      ['id', 'title', 'createdAt', 'updatedAt', 'deletedAt'].includes(
        field.name,
      ),
    );
    setTestObjectMetadataItemsInMetadataStore(jotaiStore, [
      {
        ...noteMetadata,
        nameSingular: StandardObjectNameSingular.AgentChatThread,
        namePlural: 'agentChatThreads',
        labelSingular: 'Chat',
        labelPlural: 'Chats',
        fields: chatFields,
        readableFields: chatFields,
        updatableFields: chatFields,
        indexMetadatas: [],
        searchFieldMetadatas: [],
      },
    ]);
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [
        ...(mockedUserData.currentUserWorkspace.permissionFlags ?? []),
        PermissionFlagType.AI,
      ],
    });
    jotaiStore.set(currentAiChatThreadState.atom, null);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
          value: true,
        },
      ],
    });
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      mockedWorkspaceMemberData,
      {
        ...mockedWorkspaceMemberData,
        id: DIRECT_MESSAGE_PEER_ID,
        name: { firstName: 'Alice', lastName: 'Example' },
        userEmail: 'alice@example.com',
      },
    ]);
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('OpenDirectMessage', ({ variables }) => {
          openDirectMessageRequest(variables.workspaceMemberId);
          return HttpResponse.json({
            data: { openDirectMessage: DIRECT_MESSAGE_THREAD_ID },
          });
        }),
        graphql.query('FindManyAgentChatThreads', () =>
          HttpResponse.json({
            data: {
              agentChatThreads: {
                edges: [
                  {
                    cursor: DIRECT_MESSAGE_THREAD_ID,
                    node: {
                      __typename: 'AgentChatThread',
                      id: DIRECT_MESSAGE_THREAD_ID,
                      title: 'Alice Example',
                      conversationType:
                        AgentChatThreadConversationType.DIRECT_MESSAGE,
                      createdAt: '2026-11-04T12:00:00.000Z',
                      updatedAt: '2026-11-04T12:00:00.000Z',
                      deletedAt: null,
                      lastActivityAt: null,
                      lastMessageText: null,
                      lastMessageSenderWorkspaceMemberId: null,
                      writerWorkspaceMemberIds: [],
                      workspaceMemberId: null,
                      assigneeId: null,
                      channelId: null,
                      channelArchivedAt: null,
                      channelSnoozedUntil: null,
                      pendingQuestionMessageId: null,
                      totalInputTokens: 0,
                      totalOutputTokens: 0,
                      totalCacheReadTokens: 0,
                      contextWindowTokens: null,
                      conversationSize: 0,
                      totalInputCredits: 0,
                      totalOutputCredits: 0,
                      participants: [],
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: null,
                  endCursor: null,
                },
                totalCount: 1,
              },
            },
          }),
        ),
        graphql.query<
          GetRecordPermissionsQuery,
          GetRecordPermissionsQueryVariables
        >('GetRecordPermissions', ({ variables }) =>
          HttpResponse.json({
            data: {
              recordPermissions: (isArray(variables.targets)
                ? variables.targets
                : [variables.targets]
              ).map((target) => ({
                __typename: 'RecordPermissionsResult',
                ...target,
                permissions: {
                  __typename: 'RecordPermissionsDTO',
                  canRead: true,
                  canUpdate: true,
                  canDelete: false,
                  canSoftDelete: false,
                },
              })),
            },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'New direct message' }),
    );
    await userEvent.type(
      await body.findByRole('searchbox', { name: 'Search members' }),
      'Alice',
    );
    await userEvent.click(
      await body.findByRole('option', { name: /Alice Example/ }),
    );
    await waitFor(() =>
      expect(openDirectMessageRequest).toHaveBeenCalledWith(
        DIRECT_MESSAGE_PEER_ID,
      ),
    );
    await expect(
      await canvas.findByText(
        getAppPath(AppPath.AiChat, { threadId: DIRECT_MESSAGE_THREAD_ID }),
      ),
    ).toBeVisible();
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      DIRECT_MESSAGE_THREAD_ID,
    );
  },
};
