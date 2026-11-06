import { getAvailableAgentChatChannelName } from 'src/engine/metadata-modules/agent-chat-channel/utils/get-available-agent-chat-channel-name.util';

describe('getAvailableAgentChatChannelName', () => {
  it('numbers a taken name past the numbers already in use', () => {
    expect(
      getAvailableAgentChatChannelName({
        name: 'Support',
        takenNames: ['Support', 'Support 2', 'Sales'],
      }),
    ).toBe('Support 3');
  });
});
