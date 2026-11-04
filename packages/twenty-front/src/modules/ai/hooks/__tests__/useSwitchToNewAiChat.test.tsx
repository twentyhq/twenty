import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';

const CHANNEL_ID = '20202020-0000-4000-8000-0000000000cc';
const NEW_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

jest.mock('@/ai/hooks/useSelectAiChatThread', () => ({
  useSelectAiChatThread: () => ({ selectAiChatThread: jest.fn() }),
}));

jest.mock('@/ai/hooks/useNavigateToAiChatPage', () => ({
  useNavigateToAiChatPage: () => ({ navigateToAiChatPage: jest.fn() }),
}));

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: jest.fn() }),
}));

const switchToNewChatAt = (pathname: string) => {
  const store = createStore();

  store.set(agentChatNewThreadChannelIdState.atom, CHANNEL_ID);
  store.set(newAiChatThreadIdState.atom, NEW_THREAD_ID);
  store.set(agentChatNewThreadRecipientsFamilyState.atomFamily(NEW_THREAD_ID), {
    isAssistantParticipant: false,
    recipientWorkspaceMemberIds: ['20202020-0000-4000-8000-0000000000bb'],
  });
  window.history.pushState({}, '', pathname);

  const { result } = renderHook(() => useSwitchToNewAiChat(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

  act(() => {
    result.current.switchToNewChat();
  });

  return store;
};

describe('useSwitchToNewAiChat', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('starts a new chat outside the inbox in no channel', () => {
    const store = switchToNewChatAt(
      getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: 'companies',
      }),
    );

    expect(store.get(agentChatNewThreadChannelIdState.atom)).toBeNull();
  });

  it('leaves the channel of a new chat started in the inbox to the inbox', () => {
    const store = switchToNewChatAt(
      getAppPath(AppPath.AiChatInbox, { threadId: null }),
    );

    expect(store.get(agentChatNewThreadChannelIdState.atom)).toBe(CHANNEL_ID);
  });

  it('starts every new chat with the default recipients', () => {
    const store = switchToNewChatAt(
      getAppPath(AppPath.AiChatInbox, { threadId: null }),
    );

    expect(
      store.get(
        agentChatNewThreadRecipientsFamilyState.atomFamily(NEW_THREAD_ID),
      ),
    ).toEqual(AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS);
  });
});
