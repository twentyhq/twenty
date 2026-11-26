import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { useIsAiChatComposerCentered } from '@/ai-chat/composer/hooks/useIsAiChatComposerCentered';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';
import { type AiChatSurface } from '@/ai-chat/types/AiChatSurface';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

const renderForSurface = ({
  surface = AI_CHAT_SURFACE.PAGE,
  threadId,
}: {
  surface?: AiChatSurface;
  threadId?: string;
} = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <AiChatSurfaceContext.Provider value={surface}>
        <AiChatTestInstance threadId={threadId}>{children}</AiChatTestInstance>
      </AiChatSurfaceContext.Provider>
    </JotaiProvider>
  );

  return renderHook(() => useIsAiChatComposerCentered(), { wrapper: Wrapper });
};

describe('useIsAiChatComposerCentered', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(newAiChatThreadIdState.atom, THREAD_ID);
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

  it('should not center the composer while the workspace setup preamble owns the intro', () => {
    jotaiStore.set(isWorkspaceSetupChatActiveState.atom, true);
    const { result } = renderForSurface();

    expect(result.current).toBe(false);
  });
});
