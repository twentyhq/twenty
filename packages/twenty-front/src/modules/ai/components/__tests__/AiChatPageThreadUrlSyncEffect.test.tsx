import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

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

let navigateToThread: ((threadId: string) => void) | undefined;

const RouteUnderTest = () => {
  const navigate = useNavigate();

  navigateToThread = (threadId: string) => navigate(`/chat/${threadId}`);

  return <AiChatPageThreadUrlSyncEffect />;
};

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
    navigateToThread = undefined;
  });

  it('should adopt the thread from the URL on a deep link', () => {
    jotaiStore.set(currentAiChatThreadState.atom, null);

    renderEffectAt(`/chat/${THREAD_A}`);

    expect(switchThreadWithDraftMock).toHaveBeenCalledWith(THREAD_A);
  });

  it('should adopt the thread the browser navigated to', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_A);

    render(
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter initialEntries={[`/chat/${THREAD_A}`]}>
          <Routes>
            <Route path={AppPath.AiChat} element={<RouteUnderTest />} />
          </Routes>
        </MemoryRouter>
      </JotaiProvider>,
    );

    expect(switchThreadWithDraftMock).not.toHaveBeenCalled();

    act(() => {
      navigateToThread?.(THREAD_B);
    });

    expect(switchThreadWithDraftMock).toHaveBeenCalledWith(THREAD_B);
  });

  it('should do nothing when the URL already names the selected thread', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_A);

    renderEffectAt(`/chat/${THREAD_A}`);

    expect(switchThreadWithDraftMock).not.toHaveBeenCalled();
  });

  // A selection that did not project — the startup restore, which
  // deliberately leaves the URL alone — must not win over a deep link.
  it('should restore the url thread when a selection bypassed the projection', () => {
    jotaiStore.set(currentAiChatThreadState.atom, null);

    renderEffectAt(`/chat/${THREAD_A}`);

    switchThreadWithDraftMock.mockClear();

    act(() => {
      jotaiStore.set(currentAiChatThreadState.atom, THREAD_B);
    });

    expect(switchThreadWithDraftMock).toHaveBeenCalledWith(THREAD_A);
  });

  it('should ignore a malformed thread param and keep the selection', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_B);

    renderEffectAt('/chat/not-a-thread-id');

    expect(switchThreadWithDraftMock).not.toHaveBeenCalled();
    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(THREAD_B);
  });

  it('should leave a bare chat url alone', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_A);

    renderEffectAt('/chat');

    expect(switchThreadWithDraftMock).not.toHaveBeenCalled();
  });
});
