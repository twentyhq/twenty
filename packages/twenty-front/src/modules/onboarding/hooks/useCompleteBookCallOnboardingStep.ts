import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { CompleteBookCallOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useCompleteBookCallOnboardingStep = () => {
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [completeBookCallOnboardingStepMutation] = useMutation(
    CompleteBookCallOnboardingStepDocument,
  );

  return useCallback(async () => {
    await completeBookCallOnboardingStepMutation();
    setNextOnboardingStatus();
  }, [completeBookCallOnboardingStepMutation, setNextOnboardingStatus]);
};
