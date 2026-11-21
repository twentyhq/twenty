import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { useSwitchToNewAiChat } from '@/ai-chat/composer/hooks/useSwitchToNewAiChat';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/constants/AiChatNewThreadDefaultRecipients';

const CHANNEL_ID = '20202020-0000-4000-8000-0000000000cc';
const NEW_THREAD_ID = '20202020-0000-4000-8000-0000000000dd';

const getNewThreadChannelId = (store: ReturnType<typeof createStore>) =>
  store.get(
    aiChatComposerNewThreadRecipientsFamilyState.atomFamily(NEW_THREAD_ID),
  ).channelId;

jest.mock('@/ai-chat/hooks/useSelectAiChatThread', () => ({
  useSelectAiChatThread: () => ({ selectAiChatThread: jest.fn() }),
}));

jest.mock('@/ai-chat/hooks/useNavigateToAiChatPage', () => ({
  useNavigateToAiChatPage: () => ({ navigateToAiChatPage: jest.fn() }),
}));

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: jest.fn() }),
}));

const switchToNewChatAt = ({
  pathname,
  inboxChannelId,
}: {
  pathname: string;
  inboxChannelId?: string;
}) => {
  const store = createStore();

  store.set(newAiChatThreadIdState.atom, NEW_THREAD_ID);
  store.set(
    aiChatComposerNewThreadRecipientsFamilyState.atomFamily(NEW_THREAD_ID),
    {
      ...AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
      channelId: CHANNEL_ID,
    },
  );
  window.history.pushState({}, '', pathname);

  const { result } = renderHook(() => useSwitchToNewAiChat(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

  act(() => {
    result.current.switchToNewChat({ inboxChannelId });
  });

  return store;
};

describe('useSwitchToNewAiChat', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('starts a new chat outside the inbox in no channel', () => {
    const store = switchToNewChatAt({
      pathname: getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: 'companies',
      }),
    });

    expect(getNewThreadChannelId(store)).toBeNull();
  });

  it('starts a new chat in the inbox in the channel the inbox shows', () => {
    const store = switchToNewChatAt({
      pathname: getAppPath(AppPath.AiChatInbox, { threadId: null }),
      inboxChannelId: 'shown-channel-id',
    });

    expect(getNewThreadChannelId(store)).toBe('shown-channel-id');
  });
});
