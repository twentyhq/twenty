import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

describe('useIsWorkspaceSetupChat', () => {
  beforeEach(() => resetJotaiStore());

  it.each([AI_CHAT_SURFACE.PAGE, AI_CHAT_SURFACE.SIDE_PANEL, undefined])(
    'only enables setup within a chat surface: %s',
    (surface) => {
      jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={jotaiStore}>
          <AiChatSurfaceContext.Provider value={surface}>
            {children}
          </AiChatSurfaceContext.Provider>
        </Provider>
      );
      const { result } = renderHook(() => useIsWorkspaceSetupChat(), {
        wrapper,
      });
      expect(result.current).toBe(surface !== undefined);
    },
  );
});
