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

    // The redirect engine tolerates /book-call while the status is PLAN_REQUIRED
    // so the plan page's "talk to us" link can land here, which means it will not
    // move us off this page on its own once the step is done. Leaving is therefore
    // explicit. The COMPLETED case needs no help: /book-call is an onboarding path,
    // so the engine routes it onward.
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
