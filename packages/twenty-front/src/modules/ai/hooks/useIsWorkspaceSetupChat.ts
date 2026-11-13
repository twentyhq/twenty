import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsWorkspaceSetupChat = () => {
  const surface = useContext(InboxSurfaceContext);
  const shouldOpenInboxAfterOnboarding = useAtomStateValue(
    shouldOpenInboxAfterOnboardingState,
  );

  return shouldOpenInboxAfterOnboarding && isDefined(surface);
};
