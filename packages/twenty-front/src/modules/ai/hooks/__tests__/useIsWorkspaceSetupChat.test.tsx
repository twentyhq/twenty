import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

describe('useIsWorkspaceSetupChat', () => {
  beforeEach(() => resetJotaiStore());

  it.each([INBOX_SURFACE.PAGE, INBOX_SURFACE.SIDE_PANEL, undefined])(
    'only enables setup within a chat surface: %s',
    (surface) => {
      jotaiStore.set(shouldOpenInboxAfterOnboardingState.atom, true);
      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={jotaiStore}>
          <InboxSurfaceContext.Provider value={surface}>
            {children}
          </InboxSurfaceContext.Provider>
        </Provider>
      );
      const { result } = renderHook(() => useIsWorkspaceSetupChat(), {
        wrapper,
      });
      expect(result.current).toBe(surface !== undefined);
    },
  );
});
