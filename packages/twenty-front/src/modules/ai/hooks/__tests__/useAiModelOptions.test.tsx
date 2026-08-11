import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const getWrapper =
  (pathname: string) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[pathname]}>
      <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
    </MemoryRouter>
  );

const renderHooks = (pathname: string) => {
  const { result } = renderHook(
    () => {
      const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
      const setAiModels = useSetAtomState(aiModelsState);

      return {
        setCurrentWorkspace,
        setAiModels,
        ...useAiModelOptions({ variant: 'pinned-default' }),
      };
    },
    { wrapper: getWrapper(pathname) },
  );

  act(() => {
    result.current.setCurrentWorkspace({
      fastModel: 'default-fast-model',
      smartModel: 'default-smart-model',
      useRecommendedModels: true,
    } as never);
    result.current.setAiModels([
      {
        modelId: 'default-smart-model',
        label: 'GPT-5.2',
        providerName: 'openai',
      },
      {
        modelId: 'default-fast-model',
        label: 'GPT-5.6 Luna',
        providerName: 'openai',
      },
    ] as never);
  });

  return result;
};

describe('useAiModelOptions', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetJotaiStore();
  });

  it('should pin the workspace fast model during the onboarding chat', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    const result = renderHooks(getAppPath(AppPath.AiChat, { threadId: null }));

    expect(result.current.pinnedOption?.label).toBe('GPT-5.6 Luna');
  });

  it('should pin the workspace smart model on a plain chat page', () => {
    const result = renderHooks(getAppPath(AppPath.AiChat, { threadId: null }));

    expect(result.current.pinnedOption?.label).toBe('GPT-5.2');
  });

  it('should pin the workspace smart model elsewhere', () => {
    const result = renderHooks('/objects/companies');

    expect(result.current.pinnedOption?.label).toBe('GPT-5.2');
  });
});
