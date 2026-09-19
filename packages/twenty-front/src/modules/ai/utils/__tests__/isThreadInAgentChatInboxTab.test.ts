import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { isThreadInAgentChatInboxTab } from '@/ai/utils/isThreadInAgentChatInboxTab';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

const VIEWER_ID = 'uw-viewer';

const buildThread = (overrides: Partial<FlatAgentChatThread> = {}) =>
  ({
    id: 'thread-1',
    channelId: null,
    workflowRunId: null,
    assigneeUserWorkspaceId: null,
    mentionedUserWorkspaceIds: [],
    ...overrides,
  }) as FlatAgentChatThread;

const isIn = (thread: FlatAgentChatThread, tab: string) =>
  isThreadInAgentChatInboxTab(thread, tab as never, VIEWER_ID);

describe('isThreadInAgentChatInboxTab', () => {
  it('counts a thread handed to the reader as assigned', () => {
    const thread = buildThread({
      channelId: 'channel-1',
      assigneeUserWorkspaceId: VIEWER_ID,
    });

    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.ASSIGNED)).toBe(true);
    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.SUBSCRIBED)).toBe(false);
    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES)).toBe(false);
  });

  it('counts a channel thread that named the reader as subscribed', () => {
    const thread = buildThread({
      channelId: 'channel-1',
      mentionedUserWorkspaceIds: [VIEWER_ID],
    });

    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.SUBSCRIBED)).toBe(true);
    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.ASSIGNED)).toBe(false);
  });

  it('leaves a mention outside any channel out of subscribed', () => {
    const thread = buildThread({ mentionedUserWorkspaceIds: [VIEWER_ID] });

    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.SUBSCRIBED)).toBe(false);
    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES)).toBe(true);
  });

  it('counts every chat outside a channel as a direct message', () => {
    expect(isIn(buildThread(), AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES)).toBe(
      true,
    );
    expect(
      isIn(
        buildThread({ channelId: 'channel-1' }),
        AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES,
      ),
    ).toBe(false);
  });

  it('leaves a workflow run conversation out of direct messages', () => {
    const thread = buildThread({ workflowRunId: 'run-1' });

    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES)).toBe(false);
  });

  it('takes everything under All', () => {
    expect(
      isIn(buildThread({ channelId: 'channel-1' }), AGENT_CHAT_INBOX_TAB.ALL),
    ).toBe(true);
  });

  it('lets a thread answer to more than one tab at once', () => {
    const thread = buildThread({ assigneeUserWorkspaceId: VIEWER_ID });

    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.ASSIGNED)).toBe(true);
    expect(isIn(thread, AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES)).toBe(true);
  });
});
