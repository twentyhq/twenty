import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsAiChatComposerCentered } from '@/ai/hooks/useIsAiChatComposerCentered';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AiChatSurface } from '@/ai/types/AiChatSurface';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const INSTANCE_ID = 'aiChatComposerCenteredTest';
const THREAD_ID = 'thread-1';

const renderForSurface = ({
  surface = AI_CHAT_SURFACE.PAGE,
  preamble = null,
}: {
  surface?: AiChatSurface;
  preamble?: ReactNode;
} = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <AiChatSurfaceContext.Provider value={surface}>
          <AiChatMessageListPreambleContext.Provider value={preamble}>
            {children}
          </AiChatMessageListPreambleContext.Provider>
        </AiChatSurfaceContext.Provider>
      </AgentChatComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  return renderHook(() => useIsAiChatComposerCentered(), { wrapper: Wrapper });
};

describe('useIsAiChatComposerCentered', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('should center the composer on an empty full page chat', () => {
    const { result } = renderForSurface();

    expect(result.current).toBe(true);
  });

  it('should not center the composer in the side panel', () => {
    const { result } = renderForSurface({
      surface: AI_CHAT_SURFACE.SIDE_PANEL,
    });

    expect(result.current).toBe(false);
  });

  it('should not center the composer once the thread has messages', () => {
    jotaiStore.set(
      agentChatMessagesComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        familyKey: { threadId: THREAD_ID },
      }),
      [{ id: 'message-1', role: 'user', parts: [] }],
    );

    const { result } = renderForSurface();

    expect(result.current).toBe(false);
  });

  it('should not center the composer while a preamble owns the intro', () => {
    const { result } = renderForSurface({ preamble: <div /> });

    expect(result.current).toBe(false);
  });
});
