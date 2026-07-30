import { useIsPlanRequired } from '@/onboarding/hooks/useIsPlanRequired';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { CompleteBookCallOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useCompleteBookCallOnboardingStep = () => {
  const navigate = useNavigate();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const isPlanRequired = useIsPlanRequired();
  const [completeBookCallOnboardingStepMutation] = useMutation(
    CompleteBookCallOnboardingStepDocument,
  );

  return useCallback(async () => {
    await completeBookCallOnboardingStepMutation();
    setNextOnboardingStatus();

    if (isPlanRequired) {
      navigate(AppPath.PlanRequired);
    }
  }, [
    completeBookCallOnboardingStepMutation,
    setNextOnboardingStatus,
    isPlanRequired,
    navigate,
  ]);
};
