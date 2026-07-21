import { useEffect } from 'react';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const ClearShouldOpenAiChatAfterOnboardingEffect = () => {
  const setShouldOpenAiChatAfterOnboarding = useSetAtomState(
    shouldOpenAiChatAfterOnboardingState,
  );

  useEffect(() => {
    setShouldOpenAiChatAfterOnboarding(false);
  }, [setShouldOpenAiChatAfterOnboarding]);

  return null;
};
