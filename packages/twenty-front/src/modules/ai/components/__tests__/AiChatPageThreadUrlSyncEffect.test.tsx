import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const navigateAppMock = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateAppMock,
}));

const switchThreadWithDraftMock = jest.fn((toThreadId: string) => {
  jotaiStore.set(currentAiChatThreadState.atom, toThreadId);
});

jest.mock('@/ai/hooks/useSwitchAgentChatThreadWithDraft', () => ({
  useSwitchAgentChatThreadWithDraft: () => ({
    switchThreadWithDraft: switchThreadWithDraftMock,
  }),
}));

const THREAD_A = '11111111-1111-4111-8111-111111111111';
const THREAD_B = '22222222-2222-4222-8222-222222222222';

const renderEffectAt = (initialPath: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path={AppPath.AiChat}
            element={<AiChatPageThreadUrlSyncEffect />}
          />
        </Routes>
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('AiChatPageThreadUrlSyncEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('should switch to the thread from the URL on a deep link', () => {
    jotaiStore.set(currentAiChatThreadState.atom, null);

    renderEffectAt(`/chat/${THREAD_A}`);

    expect(switchThreadWithDraftMock).toHaveBeenCalledWith(THREAD_A);
    expect(navigateAppMock).not.toHaveBeenCalled();
  });

  it('should write the current thread into the URL by replacement', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_B);

    renderEffectAt('/chat');

    expect(switchThreadWithDraftMock).not.toHaveBeenCalled();
    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_B },
      undefined,
      { replace: true, state: null },
    );
  });

  it('should update the URL when the thread changes while mounted', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_A);

    renderEffectAt(`/chat/${THREAD_A}`);
    navigateAppMock.mockClear();

    act(() => {
      jotaiStore.set(currentAiChatThreadState.atom, THREAD_B);
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_B },
      undefined,
      { replace: true, state: null },
    );
  });

  it('should clear the URL param when switching to a new chat draft', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_A);

    renderEffectAt(`/chat/${THREAD_A}`);
    navigateAppMock.mockClear();

    act(() => {
      jotaiStore.set(
        currentAiChatThreadState.atom,
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
      );
    });

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: null },
      undefined,
      { replace: true, state: null },
    );
  });

  it('should normalize a malformed thread param from the current thread', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_B);

    renderEffectAt('/chat/not-a-thread-id');

    expect(switchThreadWithDraftMock).not.toHaveBeenCalled();
    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_B },
      undefined,
      { replace: true, state: null },
    );
  });

  it('should carry the history entry state through URL replacements', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_B);

    render(
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter
          initialEntries={[
            { pathname: '/chat', state: { returnLocation: '/objects/people' } },
          ]}
        >
          <Routes>
            <Route
              path={AppPath.AiChat}
              element={<AiChatPageThreadUrlSyncEffect />}
            />
          </Routes>
        </MemoryRouter>
      </JotaiProvider>,
    );

    expect(navigateAppMock).toHaveBeenCalledWith(
      AppPath.AiChat,
      { threadId: THREAD_B },
      undefined,
      { replace: true, state: { returnLocation: '/objects/people' } },
    );
  });
});
