import { getAvailableAgentChatChannelName } from 'src/engine/metadata-modules/agent-chat-channel/utils/get-available-agent-chat-channel-name.util';

describe('getAvailableAgentChatChannelName', () => {
  it('numbers a taken name past the numbers already in use', () => {
    expect(
      getAvailableAgentChatChannelName({
        name: 'Support',
        flatAgentChatChannelMaps: {
          byUniversalIdentifier: {
            support: { name: 'Support' },
            supportTwo: { name: 'Support 2' },
            sales: { name: 'Sales' },
          },
        },
      }),
    ).toBe('Support 3');
  });
});
