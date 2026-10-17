import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { isAgentChatThreadInChannelView } from '@/ai/utils/isAgentChatThreadInChannelView';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const OPEN_CHANNEL_VIEW: AgentChatChannelView = {
  channelId: 'channel-1',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
};

const buildThread = (
  thread: Partial<AgentChatThreadRecord> = {},
): AgentChatThreadRecord => ({
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

describe('isAgentChatThreadInChannelView', () => {
  it('lists open chats of the channel', () => {
    expect(
      isAgentChatThreadInChannelView({
        thread: buildThread(),
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
      }),
    ).toBe(true);
  });

  it('leaves out chats of other channels and deleted chats', () => {
    expect(
      isAgentChatThreadInChannelView({
        thread: buildThread({ channelId: 'channel-2' }),
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInChannelView({
        thread: buildThread({ deletedAt: '2026-01-02T00:00:00.000Z' }),
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
      }),
    ).toBe(false);
  });

  it('lists chats the channel filed as done under Done only', () => {
    const doneThread = buildThread({
      channelArchivedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(
      isAgentChatThreadInChannelView({
        thread: doneThread,
        channelView: OPEN_CHANNEL_VIEW,
        currentWorkspaceMemberId: 'member-1',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInChannelView({
        thread: doneThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          channelStatus: AgentChatChannelThreadStatus.DONE,
        },
        currentWorkspaceMemberId: 'member-1',
      }),
    ).toBe(true);
  });

  it('narrows to unassigned chats or chats assigned to the member', () => {
    const assignedThread = buildThread({ assigneeId: 'member-1' });

    expect(
      isAgentChatThreadInChannelView({
        thread: assignedThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          assignment: AgentChatChannelAssignmentFilter.UNASSIGNED,
        },
        currentWorkspaceMemberId: 'member-1',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInChannelView({
        thread: assignedThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
        },
        currentWorkspaceMemberId: 'member-1',
      }),
    ).toBe(true);
    expect(
      isAgentChatThreadInChannelView({
        thread: assignedThread,
        channelView: {
          ...OPEN_CHANNEL_VIEW,
          assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
        },
        currentWorkspaceMemberId: 'member-2',
      }),
    ).toBe(false);
  });
});
