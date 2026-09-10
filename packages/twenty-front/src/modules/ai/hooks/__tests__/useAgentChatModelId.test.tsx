import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderHooks = () =>
  renderHook(
    () => ({
      setSelectedTier: useSetAtomState(agentChatUserSelectedModelTierState),
      setShouldOpenAiChatAfterOnboarding: useSetAtomState(
        shouldOpenAiChatAfterOnboardingState,
      ),
      ...useAgentChatModelId(),
    }),
    { wrapper: Wrapper },
  );

describe('useAgentChatModelId', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetJotaiStore();
  });

  it('sends nothing so the server falls back to the workspace chat tier', () => {
    const { result } = renderHooks();

    expect(result.current.selectedTier).toBeNull();
    expect(result.current.modelIdForRequest).toBeUndefined();
  });

  it('sends the auto-select id of the tier the user picked', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setSelectedTier('smart');
    });

    expect(result.current.selectedTier).toBe('smart');
    expect(result.current.modelIdForRequest).toBe('default-smart-model');
  });

  it('runs the workspace setup chat on the fast tier unless the user picked one', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setShouldOpenAiChatAfterOnboarding(true);
    });

    expect(result.current.modelIdForRequest).toBe('default-fast-model');

    act(() => {
      result.current.setSelectedTier('extraSmart');
    });

    expect(result.current.modelIdForRequest).toBe('default-extra-smart-model');
  });
});
