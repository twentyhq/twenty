import { currentUserState } from '@/auth/states/currentUserState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { NO_PREVIOUS_ONBOARDING_STEP_ERROR_CODE } from '@/onboarding/constants/NoPreviousOnboardingStepErrorCode';
import { useRecomputeCreateProfileFreeCredits } from '@/onboarding/hooks/useRecomputeCreateProfileFreeCredits';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { useMutation } from '@apollo/client/react';

import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import {
  GoBackToPreviousOnboardingStepDocument,
  OnboardingStatus,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const useGoBackToPreviousOnboardingStep = () => {
  const store = useStore();
  const { enqueueToast } = useToast();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();
  const recomputeCreateProfileFreeCredits =
    useRecomputeCreateProfileFreeCredits();
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

      const isLeavingProfileStep =
        store.get(currentUserState.atom)?.onboardingStatus ===
        OnboardingStatus.PROFILE_CREATION;

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

      if (isLeavingProfileStep) {
        setOnboardingStepFreeCredits('createProfile', 0);
      }

      if (
        onboardingStepNavigation.onboardingStatus ===
        OnboardingStatus.PROFILE_CREATION
      ) {
        recomputeCreateProfileFreeCredits();
      }
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

      enqueueToast(getToastOptionsFromError({ error }));
    }
  }, [
    goBackToPreviousOnboardingStepMutation,
    enqueueToast,
    recomputeCreateProfileFreeCredits,
    setOnboardingStepFreeCredits,
    store,
  ]);

  return {
    goBackToPreviousOnboardingStep,
    isGoingBackToPreviousOnboardingStep: loading,
  };
};
