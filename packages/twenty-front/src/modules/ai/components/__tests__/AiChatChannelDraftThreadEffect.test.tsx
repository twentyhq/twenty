import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { AiChatChannelDraftThreadEffect } from '@/ai/components/AiChatChannelDraftThreadEffect';
import { agentChatDraftChannelIdState } from '@/ai/states/agentChatDraftChannelIdState';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const switchThreadWithDraftMock = jest.fn();

jest.mock('@/ai/hooks/useSwitchAgentChatThreadWithDraft', () => ({
  useSwitchAgentChatThreadWithDraft: () => ({
    switchThreadWithDraft: switchThreadWithDraftMock,
  }),
}));

const CHANNEL_ID = '5e8c8a1c-6d17-4d75-8d47-3a6e1a2d0b11';
const THREAD_ID = '20202020-0000-4000-8000-000000000001';

const renderEffectAt = (path: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path={AppPath.AiChatChannel}
            element={<AiChatChannelDraftThreadEffect channelId={CHANNEL_ID} />}
          />
        </Routes>
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('AiChatChannelDraftThreadEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('starts a new chat of the channel when the URL names no thread', () => {
    jotaiStore.set(threadIdCreatedFromDraftState.atom, THREAD_ID);

    const { unmount } = renderEffectAt(`/chat/channels/${CHANNEL_ID}`);

    expect(switchThreadWithDraftMock).toHaveBeenCalledWith(
      AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    );
    expect(jotaiStore.get(agentChatDraftChannelIdState.atom)).toBe(CHANNEL_ID);
    expect(jotaiStore.get(threadIdCreatedFromDraftState.atom)).toBeNull();

    unmount();

    expect(jotaiStore.get(agentChatDraftChannelIdState.atom)).toBeNull();
  });

  it('leaves a thread named in the URL to the URL sync', () => {
    renderEffectAt(`/chat/channels/${CHANNEL_ID}/${THREAD_ID}`);

    expect(switchThreadWithDraftMock).not.toHaveBeenCalled();
    expect(jotaiStore.get(agentChatDraftChannelIdState.atom)).toBeNull();
  });
});
