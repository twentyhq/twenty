import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef } from 'react';

import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCreatingWorkspaceState } from '@/auth/states/isCreatingWorkspaceState';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { onboardingActivationFailedState } from '@/onboarding/states/onboardingActivationFailedState';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ActivateWorkspaceDocument } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
  width: 200px;
`;

export const WorkspaceActivation = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { loadCurrentUser } = useLoadCurrentUser();
  const [activateWorkspace, { loading: isActivating }] = useMutation(
    ActivateWorkspaceDocument,
  );
  const onboardingActivationFailed = useAtomStateValue(
    onboardingActivationFailedState,
  );
  const setOnboardingActivationFailed = useSetAtomState(
    onboardingActivationFailedState,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const setIsCreatingWorkspace = useSetAtomState(isCreatingWorkspaceState);
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const setIsAppEffectRedirectEnabled = useSetAtomState(
    isAppEffectRedirectEnabledState,
  );

  const activate = useCallback(async () => {
    setOnboardingActivationFailed(false);

    try {
      const result = await activateWorkspace({
        variables: {
          input: {},
        },
      });

      if (isDefined(result.error)) {
        throw result.error;
      }

      setIsAppEffectRedirectEnabled(false);
      await loadCurrentUser();
      setNextOnboardingStatus();
      setIsCreatingWorkspace(false);
      setIsAppEffectRedirectEnabled(true);
    } catch (error) {
      setIsAppEffectRedirectEnabled(true);
      setIsCreatingWorkspace(false);
      setOnboardingActivationFailed(true);

      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  }, [
    activateWorkspace,
    enqueueErrorSnackBar,
    loadCurrentUser,
    setOnboardingActivationFailed,
    setIsAppEffectRedirectEnabled,
    setIsCreatingWorkspace,
    setNextOnboardingStatus,
  ]);

  // Guard the one-shot trigger with a ref, not state: a ref mutation is
  // synchronous and survives StrictMode's double-invocation of effects, whereas
  // a state flag stays false in the second (same-closure) invocation and fires
  // a second concurrent activation that trips the server's lock.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasTriggeredRef = useRef(false);
  useEffect(() => {
    if (hasTriggeredRef.current || !isDefined(currentWorkspace)) {
      return;
    }

    hasTriggeredRef.current = true;
    setOnboardingFreeCredits({
      importContacts: 0,
      inviteTeam: 0,
      installApps: 0,
    });
    void activate();
  }, [activate, currentWorkspace, setOnboardingFreeCredits]);

  if (!onboardingActivationFailed) {
    return null;
  }

  return (
    <StyledContainer>
      <OnboardingStepAnimatedItem index={0}>
        <Logo
          primaryLogo={
            isNonEmptyString(currentWorkspace?.logo)
              ? currentWorkspace?.logo
              : undefined
          }
        />
      </OnboardingStepAnimatedItem>
      <OnboardingStepAnimatedItem index={1}>
        <Title>
          <Trans>Workspace creation failed</Trans>
        </Title>
      </OnboardingStepAnimatedItem>
      <OnboardingStepAnimatedItem index={2}>
        <SubTitle>
          <Trans>
            Something went wrong while creating your workspace. Please try
            again.
          </Trans>
        </SubTitle>
      </OnboardingStepAnimatedItem>
      <OnboardingStepAnimatedItem index={3}>
        <StyledButtonContainer>
          <MainButton
            title={t`Retry`}
            onClick={() => {
              void activate();
            }}
            disabled={isActivating}
            fullWidth
          />
        </StyledButtonContainer>
      </OnboardingStepAnimatedItem>
    </StyledContainer>
  );
};
