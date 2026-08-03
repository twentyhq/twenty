import { currentUserState } from '@/auth/states/currentUserState';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { GoBackToPreviousOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useGoBackToPreviousOnboardingStep = () => {
  const store = useStore();
  const [goBackToPreviousOnboardingStepMutation, { loading }] = useMutation(
    GoBackToPreviousOnboardingStepDocument,
  );

  const goBackToPreviousOnboardingStep = useCallback(async () => {
    const { data } = await goBackToPreviousOnboardingStepMutation();
    const onboardingStepNavigation = data?.goBackToPreviousOnboardingStep;

    if (!isDefined(onboardingStepNavigation)) {
      return;
    }

    store.set(onboardingNavigationDirectionState.atom, 'backward');
    store.set(currentUserState.atom, (currentUser) => {
      if (!isDefined(currentUser)) {
        return currentUser;
      }

      return {
        ...currentUser,
        onboardingStatus: onboardingStepNavigation.onboardingStatus,
        previousOnboardingStatus:
          onboardingStepNavigation.previousOnboardingStatus,
      };
    });
  }, [goBackToPreviousOnboardingStepMutation, store]);

  return {
    goBackToPreviousOnboardingStep,
    isGoingBackToPreviousOnboardingStep: loading,
  };
};
