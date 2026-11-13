import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { InboxNewThreadChannelEffect } from '@/inbox/components/InboxNewThreadChannelEffect';
import { setInboxSelectedChannelView } from '@/inbox/testing/setInboxSelectedChannelView';
import { inboxNewThreadChannelIdState } from '@/inbox/states/inboxNewThreadChannelIdState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const CHANNEL_ID = '20202020-0000-4000-8000-0000000000cc';

const renderEffect = (shownChannelId: string | null) => {
  const store = createStore();

  store.set(inboxNewThreadChannelIdState.atom, 'previous-channel-id');
  setInboxSelectedChannelView(
    store,
    shownChannelId === null
      ? null
      : {
          channelId: shownChannelId,
          channelStatus: AgentChatChannelThreadStatus.OPEN,
          assignment: AgentChatChannelAssignmentFilter.ANY,
          filter: AgentChatChannelThreadFilter.ANY,
        },
  );

  render(
    <JotaiProvider store={store}>
      <InboxNewThreadChannelEffect />
    </JotaiProvider>,
  );

  return store;
};

describe('InboxNewThreadChannelEffect', () => {
  it('files the new chat into the channel the inbox shows', () => {
    const store = renderEffect(CHANNEL_ID);

    expect(store.get(inboxNewThreadChannelIdState.atom)).toBe(CHANNEL_ID);
  });

  it('keeps the new chat out of any channel when the inbox shows none', () => {
    const store = renderEffect(null);

    expect(store.get(inboxNewThreadChannelIdState.atom)).toBeNull();
  });
});
