import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { NO_PREVIOUS_ONBOARDING_STEP_ERROR_CODE } from '@/onboarding/constants/NoPreviousOnboardingStepErrorCode';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { getCreateProfileCreditsReward } from '@/onboarding/utils/getCreateProfileCreditsReward';
import { getInviteTeamCreditsReward } from '@/onboarding/utils/getInviteTeamCreditsReward';
import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';
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
        setOnboardingStepFreeCredits(
          'createProfile',
          getCreateProfileCreditsReward({
            currentUser: store.get(currentUserState.atom),
            currentWorkspaceMember: store.get(currentWorkspaceMemberState.atom),
            onboardingConfig: store.get(onboardingConfigState.atom),
          }),
        );
      }

      if (
        onboardingStepNavigation.onboardingStatus ===
        OnboardingStatus.INVITE_TEAM
      ) {
        setOnboardingStepFreeCredits(
          'inviteTeam',
          getInviteTeamCreditsReward({
            invitedTeammatesCount: getValidInviteEmails(
              store.get(onboardingInviteTeamEmailsDraftState.atom) ?? [],
            ).length,
            onboardingConfig: store.get(onboardingConfigState.atom),
          }),
        );
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
    setOnboardingStepFreeCredits,
    store,
  ]);

  return {
    goBackToPreviousOnboardingStep,
    isGoingBackToPreviousOnboardingStep: loading,
  };
};
