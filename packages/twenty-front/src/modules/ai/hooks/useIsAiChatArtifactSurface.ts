import { useLocation } from 'react-router-dom';

import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiModePath } from '~/utils/isAiModePath';

// Only a chat on the main page, full page or in the inbox, leaves room for a
// side panel artifact; the onboarding chat owns the screen.
export const useIsInboxArtifactSurface = () => {
  const { pathname } = useLocation();
  const shouldOpenInboxAfterOnboarding = useAtomStateValue(
    shouldOpenInboxAfterOnboardingState,
  );

  return isAiModePath(pathname) && !shouldOpenInboxAfterOnboarding;
};
