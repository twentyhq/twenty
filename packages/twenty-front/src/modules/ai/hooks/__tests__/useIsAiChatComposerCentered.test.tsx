import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsAiChatComposerCentered } from '@/ai/hooks/useIsAiChatComposerCentered';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { type AiChatSurface } from '@/ai/types/AiChatSurface';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

const renderForSurface = ({
  surface = AI_CHAT_SURFACE.PAGE,
}: {
  surface?: AiChatSurface;
} = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <AiChatSurfaceContext.Provider value={surface}>
        {children}
      </AiChatSurfaceContext.Provider>
    </JotaiProvider>
  );

  return renderHook(() => useIsAiChatComposerCentered(), { wrapper: Wrapper });
};

describe('useIsAiChatComposerCentered', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(newAiChatThreadIdState.atom, THREAD_ID);
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('should center the composer on an empty full page chat', () => {
    const { result } = renderForSurface();

    expect(result.current).toBe(true);
  });

  it('centers a new draft even if the previous conversation was still loading', () => {
    jotaiStore.set(agentChatMessagesLoadingState.atom, true);
    const { result } = renderForSurface();

    expect(result.current).toBe(true);
  });

  it('keeps an existing conversation bottom-aligned before, during and after fetching messages', () => {
    jotaiStore.set(currentAiChatThreadState.atom, 'existing-thread');
    jotaiStore.set(agentChatDisplayedThreadState.atom, 'existing-thread');
    const { result } = renderForSurface();

    expect(result.current).toBe(false);
    act(() => jotaiStore.set(agentChatMessagesLoadingState.atom, true));
    expect(result.current).toBe(false);
    act(() => jotaiStore.set(agentChatMessagesLoadingState.atom, false));
    expect(result.current).toBe(false);
  });

  it('keeps the composer centered on the new chat until its first message', () => {
    const { result } = renderForSurface();

    expect(result.current).toBe(true);

    act(() =>
      jotaiStore.set(
        agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
        [{ id: 'message-1', role: 'user', parts: [] }],
      ),
    );

    expect(result.current).toBe(false);
  });

  it('does not center while the initial route has not selected a thread yet', () => {
    jotaiStore.set(currentAiChatThreadState.atom, null);
    const { result } = renderForSurface();
    expect(result.current).toBe(false);
  });

  it('should not center the composer in the side panel', () => {
    const { result } = renderForSurface({
      surface: AI_CHAT_SURFACE.SIDE_PANEL,
    });

    expect(result.current).toBe(false);
  });

  it('should not center the composer once the thread has messages', () => {
    jotaiStore.set(
      agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
      [{ id: 'message-1', role: 'user', parts: [] }],
    );

    const { result } = renderForSurface();

    expect(result.current).toBe(false);
  });

  it('should not center the composer while the workspace setup preamble owns the intro', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    const { result } = renderForSurface();

    expect(result.current).toBe(false);
  });
});
