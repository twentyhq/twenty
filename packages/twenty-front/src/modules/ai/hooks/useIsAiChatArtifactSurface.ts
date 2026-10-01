import { useLocation } from 'react-router-dom';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiModePath } from '~/utils/isAiModePath';

// Only a chat on the main page, full page or in the inbox, leaves room for a
// side panel artifact; the onboarding chat owns the screen.
export const useIsAiChatArtifactSurface = () => {
  const { pathname } = useLocation();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  return isAiModePath(pathname) && !shouldOpenAiChatAfterOnboarding;
};
