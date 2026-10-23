import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { AiChatInboxNewThreadChannelEffect } from '@/ai/components/AiChatInboxNewThreadChannelEffect';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const CHANNEL_ID = '20202020-0000-4000-8000-0000000000cc';

const renderEffect = (shownChannelId: string | null) => {
  const store = createStore();

  store.set(agentChatNewThreadChannelIdState.atom, 'previous-channel-id');
  store.set(
    agentChatChannelViewState.atom,
    shownChannelId === null
      ? null
      : {
          channelId: shownChannelId,
          channelStatus: AgentChatChannelThreadStatus.OPEN,
          assignment: AgentChatChannelAssignmentFilter.ANY,
        },
  );

  render(
    <JotaiProvider store={store}>
      <AiChatInboxNewThreadChannelEffect />
    </JotaiProvider>,
  );

  return store;
};

describe('AiChatInboxNewThreadChannelEffect', () => {
  it('files the new chat into the channel the inbox shows', () => {
    const store = renderEffect(CHANNEL_ID);

    expect(store.get(agentChatNewThreadChannelIdState.atom)).toBe(CHANNEL_ID);
  });

  it('keeps the new chat out of any channel when the inbox shows none', () => {
    const store = renderEffect(null);

    expect(store.get(agentChatNewThreadChannelIdState.atom)).toBeNull();
  });
});
