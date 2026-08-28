import { createStore } from 'jotai';

import { isAiChatArtifactSurface } from '@/ai/utils/isAiChatArtifactSurface';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

describe('isAiChatArtifactSurface', () => {
  it('should be an artifact surface on the full page chat', () => {
    window.history.pushState({}, '', '/chat');

    expect(isAiChatArtifactSurface(createStore())).toBe(true);
  });

  it('should not be an artifact surface in the onboarding chat', () => {
    window.history.pushState({}, '', '/chat');

    const store = createStore();

    store.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    expect(isAiChatArtifactSurface(store)).toBe(false);
  });

  it('should not be an artifact surface outside the chat page', () => {
    window.history.pushState({}, '', '/objects/companies');

    expect(isAiChatArtifactSurface(createStore())).toBe(false);
  });
});
