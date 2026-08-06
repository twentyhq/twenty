import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
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

const renderHooks = ({
  pathname,
  userSelectedModel = null,
}: {
  pathname: string;
  userSelectedModel?: string | null;
}) => {
  const { result } = renderHook(
    () => {
      const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
      const setAiModels = useSetAtomState(aiModelsState);
      const setAgentChatUserSelectedModel = useSetAtomState(
        agentChatUserSelectedModelState,
      );

      return {
        setCurrentWorkspace,
        setAiModels,
        setAgentChatUserSelectedModel,
        ...useAgentChatModelId(),
      };
    },
    { wrapper: getWrapper(pathname) },
  );

  act(() => {
    result.current.setCurrentWorkspace({
      fastModel: 'openai/gpt-5-mini',
      smartModel: 'openai/gpt-5.2',
      useRecommendedModels: false,
      enabledAiModelIds: ['openai/gpt-4.1'],
    } as never);
    result.current.setAiModels([
      { modelId: 'openai/gpt-4.1', isDeprecated: false },
    ] as never);
    result.current.setAgentChatUserSelectedModel(userSelectedModel);
  });

  return result;
};

describe('useAgentChatModelId', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should request the workspace fast model on the workspace setup page', () => {
    const result = renderHooks({ pathname: AppPath.WorkspaceSetup });

    expect(result.current.modelIdForRequest).toBe('openai/gpt-5-mini');
  });

  it('should request no model elsewhere so the server falls back to the smart model', () => {
    const result = renderHooks({ pathname: '/objects/companies' });

    expect(result.current.modelIdForRequest).toBeUndefined();
  });

  it('should let a user selected model win on the workspace setup page', () => {
    const result = renderHooks({
      pathname: AppPath.WorkspaceSetup,
      userSelectedModel: 'openai/gpt-4.1',
    });

    expect(result.current.modelIdForRequest).toBe('openai/gpt-4.1');
  });

  it('should keep an auto-select sentinel selection instead of discarding it', () => {
    const result = renderHooks({
      pathname: '/objects/companies',
      userSelectedModel: 'default-fast-model',
    });

    expect(result.current.modelIdForRequest).toBe('default-fast-model');
  });
});
