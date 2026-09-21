import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { useEffect } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const switchThreadWithDraftMock = jest.fn((toThreadId: string) => {
  jotaiStore.set(currentAiChatThreadState.atom, toThreadId);
});
const switchToNewChatMock = jest.fn();
const refreshAgentChatThreadsMock = jest.fn();

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({ switchToNewChat: switchToNewChatMock }),
}));

jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({
    refreshAgentChatThreads: refreshAgentChatThreadsMock,
  }),
}));

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

  useEffect(() => {
    navigateToThread = (threadId: string) => navigate(`/chat/${threadId}`);
  }, [navigate]);

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
    refreshAgentChatThreadsMock.mockResolvedValue([]);
    resetJotaiStore();
    navigateToThread = undefined;
  });

  it('should adopt the thread from the URL on a deep link', () => {
    jotaiStore.set(currentAiChatThreadState.atom, null);

    renderEffectAt(`/chat/${THREAD_A}`);

    expect(switchThreadWithDraftMock).toHaveBeenCalledWith(THREAD_A);
  });

  it('recovers a missing chat only after refreshing the loaded thread list', async () => {
    renderEffectAt(`/chat/${THREAD_A}`);

    expect(switchToNewChatMock).not.toHaveBeenCalled();
    expect(refreshAgentChatThreadsMock).not.toHaveBeenCalled();

    await act(async () => {
      jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
        current: [],
        draft: [],
        status: 'up-to-date',
      });
    });

    expect(refreshAgentChatThreadsMock).toHaveBeenCalledTimes(1);
    expect(switchToNewChatMock).toHaveBeenCalledTimes(1);
  });

  it('keeps a valid chat URL found by refreshing a stale thread list', async () => {
    refreshAgentChatThreadsMock.mockResolvedValue([{ id: THREAD_A }]);
    jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
      current: [{ id: THREAD_B }],
      draft: [],
      status: 'up-to-date',
    });

    await act(async () => {
      renderEffectAt(`/chat/${THREAD_A}`);
    });

    expect(refreshAgentChatThreadsMock).toHaveBeenCalledTimes(1);
    expect(switchToNewChatMock).not.toHaveBeenCalled();
  });

  it('keeps an archived chat URL when the thread exists in metadata', () => {
    jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
      current: [{ id: THREAD_A, deletedAt: '2026-09-07T00:00:00Z' }],
      draft: [],
      status: 'up-to-date',
    });

    renderEffectAt(`/chat/${THREAD_A}`);

    expect(switchThreadWithDraftMock).toHaveBeenCalledWith(THREAD_A);
    expect(refreshAgentChatThreadsMock).not.toHaveBeenCalled();
    expect(switchToNewChatMock).not.toHaveBeenCalled();
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
