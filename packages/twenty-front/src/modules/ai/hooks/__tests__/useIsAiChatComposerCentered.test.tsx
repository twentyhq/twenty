import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { INBOX_SURFACE } from '@/ai/constants/AiChatSurface';
import { InboxSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsInboxComposerCentered } from '@/ai/hooks/useIsAiChatComposerCentered';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { inboxMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { type InboxSurface } from '@/ai/types/AiChatSurface';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

const renderForSurface = ({
  surface = INBOX_SURFACE.PAGE,
}: {
  surface?: InboxSurface;
} = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <InboxSurfaceContext.Provider value={surface}>
        {children}
      </InboxSurfaceContext.Provider>
    </JotaiProvider>
  );

  return renderHook(() => useIsInboxComposerCentered(), { wrapper: Wrapper });
};

describe('useIsInboxComposerCentered', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(newInboxThreadIdState.atom, THREAD_ID);
    jotaiStore.set(currentInboxThreadState.atom, THREAD_ID);
    jotaiStore.set(inboxDisplayedThreadState.atom, THREAD_ID);
  });

  it('should center the composer on an empty full page chat', () => {
    const { result } = renderForSurface();

    expect(result.current).toBe(true);
  });

  it('centers a new draft even if the previous conversation was still loading', () => {
    jotaiStore.set(inboxMessagesLoadingState.atom, true);
    const { result } = renderForSurface();

    expect(result.current).toBe(true);
  });

  it('keeps an existing conversation bottom-aligned before, during and after fetching messages', () => {
    jotaiStore.set(currentInboxThreadState.atom, 'existing-thread');
    jotaiStore.set(inboxDisplayedThreadState.atom, 'existing-thread');
    const { result } = renderForSurface();

    expect(result.current).toBe(false);
    act(() => jotaiStore.set(inboxMessagesLoadingState.atom, true));
    expect(result.current).toBe(false);
    act(() => jotaiStore.set(inboxMessagesLoadingState.atom, false));
    expect(result.current).toBe(false);
  });

  it('keeps the composer centered on the new chat until its first message', () => {
    const { result } = renderForSurface();

    expect(result.current).toBe(true);

    act(() =>
      jotaiStore.set(
        inboxMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
        [{ id: 'message-1', role: 'user', parts: [] }],
      ),
    );

    expect(result.current).toBe(false);
  });

  it('does not center while the initial route has not selected a thread yet', () => {
    jotaiStore.set(currentInboxThreadState.atom, null);
    const { result } = renderForSurface();
    expect(result.current).toBe(false);
  });

  it('should not center the composer in the side panel', () => {
    const { result } = renderForSurface({
      surface: INBOX_SURFACE.SIDE_PANEL,
    });

    expect(result.current).toBe(false);
  });

  it('should not center the composer once the thread has messages', () => {
    jotaiStore.set(
      inboxMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
      [{ id: 'message-1', role: 'user', parts: [] }],
    );

    const { result } = renderForSurface();

    expect(result.current).toBe(false);
  });

  it('should not center the composer while the workspace setup preamble owns the intro', () => {
    jotaiStore.set(shouldOpenInboxAfterOnboardingState.atom, true);
    const { result } = renderForSurface();

    expect(result.current).toBe(false);
  });
});
