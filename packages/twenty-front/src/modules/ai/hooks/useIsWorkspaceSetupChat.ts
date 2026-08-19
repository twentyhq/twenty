import { useLocation } from 'react-router-dom';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const useIsWorkspaceSetupChat = () => {
  const { pathname } = useLocation();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  return shouldOpenAiChatAfterOnboarding && isAiChatPath(pathname);
};
