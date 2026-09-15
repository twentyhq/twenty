import { useLocation } from 'react-router-dom';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatPath } from '~/utils/isAiChatPath';

// Only the full page chat has room beside it for a side panel to act as an
// artifact surface. The onboarding chat owns the whole screen, so what it
// references opens as a page instead.
export const useIsAiChatArtifactSurface = () => {
  const { pathname } = useLocation();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  return isAiChatPath(pathname) && !shouldOpenAiChatAfterOnboarding;
};
