import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { InboxSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsWorkspaceSetupChat = () => {
  const surface = useContext(InboxSurfaceContext);
  const shouldOpenInboxAfterOnboarding = useAtomStateValue(
    shouldOpenInboxAfterOnboardingState,
  );

  return shouldOpenInboxAfterOnboarding && isDefined(surface);
};
