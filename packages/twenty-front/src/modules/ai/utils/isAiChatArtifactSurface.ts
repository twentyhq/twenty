import { type getDefaultStore } from 'jotai';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

// Only the full page chat has room beside it for a side panel to act as an
// artifact surface. The onboarding chat owns the whole screen, so what it
// references opens as a page instead.
export const isAiChatArtifactSurface = (
  store: ReturnType<typeof getDefaultStore>,
) =>
  isCurrentPathAiChatPage() &&
  !store.get(shouldOpenAiChatAfterOnboardingState.atom);
