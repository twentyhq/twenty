import { currentUserState } from '@/auth/states/currentUserState';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { NO_PREVIOUS_ONBOARDING_STEP_ERROR_CODE } from '@/onboarding/constants/NoPreviousOnboardingStepErrorCode';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { useMutation } from '@apollo/client/react';

import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { GoBackToPreviousOnboardingStepDocument } from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const useGoBackToPreviousOnboardingStep = () => {
  const store = useStore();
  const { addErrorToast } = useErrorToast();
  const [goBackToPreviousOnboardingStepMutation, { loading }] = useMutation(
    GoBackToPreviousOnboardingStepDocument,
  );

  const goBackToPreviousOnboardingStep = useCallback(async () => {
    try {
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
    } catch (error) {
      if (isGraphqlErrorOfType(error, NO_PREVIOUS_ONBOARDING_STEP_ERROR_CODE)) {
        store.set(currentUserState.atom, (currentUser) => {
          if (!isDefined(currentUser)) {
            return currentUser;
          }

          return {
            ...currentUser,
            previousOnboardingStatus: null,
          };
        });

        return;
      }

      addErrorToast(error);
    }
  }, [goBackToPreviousOnboardingStepMutation, addErrorToast, store]);

  return {
    goBackToPreviousOnboardingStep,
    isGoingBackToPreviousOnboardingStep: loading,
  };
};
