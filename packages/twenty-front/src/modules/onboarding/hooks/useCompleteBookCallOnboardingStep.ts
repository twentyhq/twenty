import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { CompleteBookCallOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useCompleteBookCallOnboardingStep = () => {
  const navigate = useNavigate();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const [completeBookCallOnboardingStepMutation] = useMutation(
    CompleteBookCallOnboardingStepDocument,
  );

  const isPlanRequired = getIsPlanRequired({
    isBillingEnabled,
    currentWorkspace,
  });

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
