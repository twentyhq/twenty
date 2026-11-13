import { type InboxChannelView } from '@/ai/types/InboxChannelView';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { isInboxThreadInChannelView } from '@/ai/utils/isInboxThreadInChannelView';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const OPEN_CHANNEL_VIEW: InboxChannelView = {
  channelId: 'channel-1',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
  filter: AgentChatChannelThreadFilter.ANY,
};

const buildThread = (
  thread: Partial<InboxThreadRecord> = {},
): InboxThreadRecord => ({
  __typename: 'AgentChatThread',
  id: 'thread-1',
  title: null,
  deletedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  lastActivityAt: '2026-01-01T00:00:00.000Z',
  channelId: 'channel-1',
  channelArchivedAt: null,
  channelSnoozedUntil: null,
  assigneeId: null,
  ...thread,
});

describe('isInboxThreadInChannelView', () => {
  it('lists open chats of the channel', () => {
    expect(
      isInboxThreadInChannelView({
        thread: buildThread(),
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(true);
  });

  it('leaves out chats of other channels and deleted chats', () => {
    expect(
      isInboxThreadInChannelView({
        thread: buildThread({ channelId: 'channel-2' }),
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(false);
    expect(
      isInboxThreadInChannelView({
        thread: buildThread({ deletedAt: '2026-01-02T00:00:00.000Z' }),
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(false);
  });

  it('lists chats the channel filed as done under Done only', () => {
    const doneThread = buildThread({
      channelArchivedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(
      isInboxThreadInChannelView({
        thread: doneThread,
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(false);
    expect(
      isInboxThreadInChannelView({
        thread: doneThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          channelStatus: AgentChatChannelThreadStatus.DONE,
        },
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(true);
  });

  it('narrows to unassigned chats or chats assigned to the member', () => {
    const assignedThread = buildThread({ assigneeId: 'member-1' });

    expect(
      isInboxThreadInChannelView({
        thread: assignedThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          assignment: AgentChatChannelAssignmentFilter.UNASSIGNED,
        },
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(false);
    expect(
      isInboxThreadInChannelView({
        thread: assignedThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
        },
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(true);
    expect(
      isInboxThreadInChannelView({
        thread: assignedThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
        },
        currentWorkspaceMemberId: 'member-2',
        isMentioned: false,
      }),
    ).toBe(false);
  });

  it('narrows to chats assigned to anyone', () => {
    const channelView = {
      ...OPEN_CHANNEL_VIEW,
      assignment: AgentChatChannelAssignmentFilter.ASSIGNED,
    };

    expect(
      isInboxThreadInChannelView({
        thread: buildThread({ assigneeId: 'member-2' }),
        channelView,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(true);
    expect(
      isInboxThreadInChannelView({
        thread: buildThread(),
        channelView,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(false);
  });

  it('narrows to chats waiting on an answer', () => {
    const channelView = {
      ...OPEN_CHANNEL_VIEW,
      filter: AgentChatChannelThreadFilter.NEEDS_INPUT,
    };

    expect(
      isInboxThreadInChannelView({
        thread: buildThread({ pendingQuestionMessageId: 'message-1' }),
        channelView,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(true);
    expect(
      isInboxThreadInChannelView({
        thread: buildThread(),
        channelView,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(false);
  });

  it('narrows to chats the member was mentioned in', () => {
    const channelView = {
      ...OPEN_CHANNEL_VIEW,
      filter: AgentChatChannelThreadFilter.MENTIONED,
    };

    expect(
      isInboxThreadInChannelView({
        thread: buildThread(),
        channelView,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: true,
      }),
    ).toBe(true);
    expect(
      isInboxThreadInChannelView({
        thread: buildThread(),
        channelView,
        currentWorkspaceMemberId: 'member-1',
        isMentioned: false,
      }),
    ).toBe(false);
  });
});
