import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { type AgentChatSelectedThreadListSource } from '@/ai/types/AgentChatSelectedThreadListSource';
import { isAgentChatSelectedThreadListSourceAccessible } from '@/ai/utils/isAgentChatSelectedThreadListSourceAccessible';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const SALES_CHANNEL_SOURCE: AgentChatSelectedThreadListSource = {
  type: 'channel',
  channelView: {
    channelId: 'sales',
    channelStatus: AgentChatChannelThreadStatus.OPEN,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.ANY,
  },
};

describe('isAgentChatSelectedThreadListSourceAccessible', () => {
  it('keeps a preset filter whatever the channels are', () => {
    expect(
      isAgentChatSelectedThreadListSourceAccessible({
        source: {
          type: 'presetFilter',
          presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.DONE,
        },
        channels: [],
      }),
    ).toBe(true);
  });

  it('keeps a channel the member can access', () => {
    expect(
      isAgentChatSelectedThreadListSourceAccessible({
        source: SALES_CHANNEL_SOURCE,
        channels: [{ id: 'sales', isAccessible: true }],
      }),
    ).toBe(true);
  });

  it.each([
    ['is gone', []],
    ['is no longer accessible', [{ id: 'sales', isAccessible: false }]],
  ])('drops a channel that %s', (_case, channels) => {
    expect(
      isAgentChatSelectedThreadListSourceAccessible({
        source: SALES_CHANNEL_SOURCE,
        channels,
      }),
    ).toBe(false);
  });
});
