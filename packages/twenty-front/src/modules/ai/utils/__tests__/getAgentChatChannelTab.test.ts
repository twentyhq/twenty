import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { getAgentChatChannelTab } from '@/ai/utils/getAgentChatChannelTab';
import { AgentChatThreadStatus } from '~/generated-metadata/graphql';

const NOW = new Date('2026-09-18T12:00:00.000Z').getTime();

const buildThread = (
  overrides: {
    status?: AgentChatThreadStatus;
    snoozedUntil?: string | null;
    assigneeUserWorkspaceId?: string | null;
  } = {},
) => ({
  status: AgentChatThreadStatus.OPEN,
  snoozedUntil: null,
  assigneeUserWorkspaceId: null,
  ...overrides,
});

describe('getAgentChatChannelTab', () => {
  it('leaves an open chat nobody has taken as unassigned', () => {
    expect(getAgentChatChannelTab(buildThread(), NOW)).toBe(
      AGENT_CHAT_CHANNEL_TAB.UNASSIGNED,
    );
  });

  it('moves an open chat somebody has taken to assigned', () => {
    expect(
      getAgentChatChannelTab(
        buildThread({ assigneeUserWorkspaceId: 'uw-tim' }),
        NOW,
      ),
    ).toBe(AGENT_CHAT_CHANNEL_TAB.ASSIGNED);
  });

  it('keeps done and snoozed ahead of the split, assignee or not', () => {
    expect(
      getAgentChatChannelTab(
        buildThread({
          status: AgentChatThreadStatus.DONE,
          assigneeUserWorkspaceId: 'uw-tim',
        }),
        NOW,
      ),
    ).toBe(AGENT_CHAT_CHANNEL_TAB.DONE);

    expect(
      getAgentChatChannelTab(
        buildThread({
          status: AgentChatThreadStatus.SNOOZED,
          snoozedUntil: '2026-09-19T12:00:00.000Z',
          assigneeUserWorkspaceId: 'uw-tim',
        }),
        NOW,
      ),
    ).toBe(AGENT_CHAT_CHANNEL_TAB.SNOOZED);
  });

  it('returns a snooze that has come due to the split', () => {
    expect(
      getAgentChatChannelTab(
        buildThread({
          status: AgentChatThreadStatus.SNOOZED,
          snoozedUntil: '2026-09-17T12:00:00.000Z',
        }),
        NOW,
      ),
    ).toBe(AGENT_CHAT_CHANNEL_TAB.UNASSIGNED);
  });
});
