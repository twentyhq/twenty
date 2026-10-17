import { getAgentChatThreadChannelStatus } from '@/ai/utils/getAgentChatThreadChannelStatus';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

describe('getAgentChatThreadChannelStatus', () => {
  it('should be open when the channel never filed the chat', () => {
    expect(
      getAgentChatThreadChannelStatus({
        lastActivityAt: '2026-01-02T00:00:00.000Z',
        channelArchivedAt: null,
        channelSnoozedUntil: null,
      }),
    ).toBe(AgentChatChannelThreadStatus.OPEN);
  });

  it('should be done when filed without a wake-up time', () => {
    expect(
      getAgentChatThreadChannelStatus({
        lastActivityAt: '2026-01-01T00:00:00.000Z',
        channelArchivedAt: '2026-01-02T00:00:00.000Z',
        channelSnoozedUntil: null,
      }),
    ).toBe(AgentChatChannelThreadStatus.DONE);
  });

  it('should be snoozed when filed with a wake-up time', () => {
    expect(
      getAgentChatThreadChannelStatus({
        lastActivityAt: '2026-01-01T00:00:00.000Z',
        channelArchivedAt: '2026-01-02T00:00:00.000Z',
        channelSnoozedUntil: '2026-01-05T00:00:00.000Z',
      }),
    ).toBe(AgentChatChannelThreadStatus.SNOOZED);
  });

  it('should reopen on activity after it was filed', () => {
    expect(
      getAgentChatThreadChannelStatus({
        lastActivityAt: '2026-01-03T00:00:00.000Z',
        channelArchivedAt: '2026-01-02T00:00:00.000Z',
        channelSnoozedUntil: '2026-01-05T00:00:00.000Z',
      }),
    ).toBe(AgentChatChannelThreadStatus.OPEN);
  });
});
