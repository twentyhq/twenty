import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useAiChatIncludedModel } from '@/ai/hooks/useAiChatIncludedModel';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import {
  AI_CHAT_INCLUDED_TEST_MODELS,
  setAiChatIncludedModelWorkspace,
} from '@/ai/testing/setAiChatIncludedModelWorkspace';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { AiModelTier as AiModelTierEnum } from '~/generated-metadata/graphql';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: 'useAiChatIncludedModelTest' }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

const setUpWorkspace = (
  options: Parameters<typeof setAiChatIncludedModelWorkspace>[1],
) => {
  setAiChatIncludedModelWorkspace(jotaiStore, options);
  jotaiStore.set(agentChatDisplayedThreadState.atom, 'thread-id');
};

const renderAiChatIncludedModel = () =>
  renderHook(() => useAiChatIncludedModel(), { wrapper: Wrapper }).result
    .current;

describe('useAiChatIncludedModel', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('includes a tier that resolves to the included model at a lower effort', () => {
    setUpWorkspace({});

    expect(renderAiChatIncludedModel().isSelectedModelIncluded).toBe(true);
  });

  it('includes nothing in a workspace without the entitlement', () => {
    setUpWorkspace({ isEntitled: false });

    expect(renderAiChatIncludedModel()).toEqual({
      includedModel: null,
      isSelectedTierModelIncluded: false,
      isAutoSwitchedToIncludedModel: false,
      isSelectedModelIncluded: false,
    });
  });

  it('includes nothing when the instance advertises no included model', () => {
    setUpWorkspace({ includedModelId: null });

    expect(renderAiChatIncludedModel().isSelectedModelIncluded).toBe(false);
  });

  it('does not include a tier pinned to another model', () => {
    setUpWorkspace({
      fastTierPinnedModelId: AI_CHAT_INCLUDED_TEST_MODELS.paid.modelId,
    });

    expect(renderAiChatIncludedModel().isSelectedModelIncluded).toBe(false);
  });

  it('bills a paid workspace tier while the allowance has room', () => {
    setUpWorkspace({ workspaceTier: AiModelTierEnum.smart });

    expect(renderAiChatIncludedModel().isSelectedModelIncluded).toBe(false);
  });

  it('includes a send that follows a paid workspace tier once the allowance is spent', () => {
    setUpWorkspace({
      workspaceTier: AiModelTierEnum.smart,
      hasReachedCreditsCap: true,
    });

    expect(renderAiChatIncludedModel()).toMatchObject({
      isSelectedTierModelIncluded: false,
      isAutoSwitchedToIncludedModel: true,
      isSelectedModelIncluded: true,
    });
  });

  it('does not include a paid tier picked on the slider once the allowance is spent', () => {
    setUpWorkspace({
      userSelectedTier: 'smart',
      hasReachedCreditsCap: true,
    });

    expect(renderAiChatIncludedModel().isSelectedModelIncluded).toBe(false);
  });

  it('names the included model with its label', () => {
    setUpWorkspace({});

    expect(renderAiChatIncludedModel().includedModel?.label).toBe(
      'GPT-5.6 Luna',
    );
  });

  it('leaves an included model the client has no label for unnamed, while still predicting the switch', () => {
    setUpWorkspace({
      workspaceTier: AiModelTierEnum.smart,
      hasReachedCreditsCap: true,
    });
    jotaiStore.set(aiModelsState.atom, [AI_CHAT_INCLUDED_TEST_MODELS.paid]);

    expect(renderAiChatIncludedModel()).toMatchObject({
      includedModel: null,
      isSelectedModelIncluded: true,
    });
  });
});
