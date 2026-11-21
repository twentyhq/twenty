import { aiChatUserSelectedModelTierState } from '@/ai-chat/states/aiChatUserSelectedModelTierState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { getAiChatModelIdForRequest } from '@/ai-chat/utils/getAiChatModelIdForRequest';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

describe('getAiChatModelIdForRequest', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetJotaiStore();
  });

  it('sends nothing so the server falls back to the workspace chat tier', () => {
    expect(getAiChatModelIdForRequest(jotaiStore)).toBeUndefined();
  });

  it('ignores a persisted tier name it does not know', () => {
    window.localStorage.setItem(
      'ai/agentChatUserSelectedModelTier',
      JSON.stringify('turbo'),
    );

    expect(getAiChatModelIdForRequest(jotaiStore)).toBeUndefined();
  });

  it('sends the auto-select id of the tier the user picked', () => {
    jotaiStore.set(aiChatUserSelectedModelTierState.atom, 'smart');

    expect(getAiChatModelIdForRequest(jotaiStore)).toBe('default-smart-model');
  });

  it('runs the workspace setup chat on the fast tier unless the user picked one', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    expect(getAiChatModelIdForRequest(jotaiStore)).toBe('default-fast-model');

    jotaiStore.set(aiChatUserSelectedModelTierState.atom, 'extraSmart');

    expect(getAiChatModelIdForRequest(jotaiStore)).toBe(
      'default-extra-smart-model',
    );
  });
});
