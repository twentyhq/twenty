import { currentUserState } from '@/auth/states/currentUserState';
import { useIsPlanRequired } from '@/onboarding/hooks/useIsPlanRequired';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { setIsBookCallOnboardingStepPending } from '@/onboarding/utils/setIsBookCallOnboardingStepPending';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { CompleteBookCallOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useCompleteBookCallOnboardingStep = () => {
  const navigate = useNavigate();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const setCurrentUser = useSetAtomState(currentUserState);
  const isPlanRequired = useIsPlanRequired();
  const [completeBookCallOnboardingStepMutation] = useMutation(
    CompleteBookCallOnboardingStepDocument,
  );

  return useCallback(async () => {
    await completeBookCallOnboardingStepMutation();

    setCurrentUser((current) =>
      setIsBookCallOnboardingStepPending(current, false),
    );
    setNextOnboardingStatus({ isCurrentStepReversible: false });

    if (isPlanRequired) {
      navigate(AppPath.PlanRequired);
    }
  }, [
    completeBookCallOnboardingStepMutation,
    setCurrentUser,
    setNextOnboardingStatus,
    isPlanRequired,
    navigate,
  ]);
};
