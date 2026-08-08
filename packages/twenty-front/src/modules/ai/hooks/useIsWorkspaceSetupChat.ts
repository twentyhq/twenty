import { matchPath, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// The workspace setup chat is the onboarding conversation, hosted on the
// chat page since the standalone workspace-setup page was removed.
export const useIsWorkspaceSetupChat = () => {
  const { pathname } = useLocation();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  return (
    shouldOpenAiChatAfterOnboarding &&
    isDefined(matchPath(AppPath.AiChat, pathname))
  );
};
