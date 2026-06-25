import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { SignInUpWorkspaceActivationV2 } from '@/auth/sign-in-up/components/SignInUpWorkspaceActivationV2';
import { SignInUpWorkspaceActivationV2Effect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceActivationV2Effect';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalContent } from 'twenty-ui/surfaces';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import { ActivateWorkspaceDocument } from '~/generated-metadata/graphql';

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[8]};
  width: 200px;
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[8]};
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

type ActivationStep = 'pending' | 'database' | 'data-model' | 'prefill';

const StyledActivationStep = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const WorkspaceActivation = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { loadCurrentUser } = useLoadCurrentUser();
  const [activateWorkspace, { loading: isActivating }] = useMutation(
    ActivateWorkspaceDocument,
  );
  const [activationStep, setActivationStep] =
    useState<ActivationStep>('pending');
  const [hasFailed, setHasFailed] = useState(false);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isOnboardingV2 = useAtomStateValue(isOnboardingV2State);

  const activate = useCallback(async () => {
    setHasFailed(false);

    const databaseTimeout = setTimeout(() => {
      setActivationStep('database');
    }, 500);
    const dataModelTimeout = setTimeout(() => {
      setActivationStep('data-model');
    }, 2000);
    const prefillTimeout = setTimeout(() => {
      setActivationStep('prefill');
    }, 5000);

    const clearStepTimeouts = () => {
      clearTimeout(databaseTimeout);
      clearTimeout(dataModelTimeout);
      clearTimeout(prefillTimeout);
    };

    try {
      const result = await activateWorkspace({
        variables: {
          input: {},
        },
      });

      if (isDefined(result.error)) {
        throw result.error;
      }

      await loadCurrentUser();
      setNextOnboardingStatus();
    } catch (error) {
      setActivationStep('pending');
      setHasFailed(true);

      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      clearStepTimeouts();
    }
  }, [
    activateWorkspace,
    enqueueErrorSnackBar,
    loadCurrentUser,
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
    void activate();
  }, [activate, currentWorkspace]);

  if (hasFailed) {
    return (
      <ModalContent isVerticallyCentered isHorizontallyCentered>
        <Logo
          primaryLogo={
            isNonEmptyString(currentWorkspace?.logo)
              ? currentWorkspace?.logo
              : undefined
          }
        />
        <Title>
          <Trans>Workspace creation failed</Trans>
        </Title>
        <SubTitle>
          <Trans>
            Something went wrong while creating your workspace. Please try
            again.
          </Trans>
        </SubTitle>
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
      </ModalContent>
    );
  }

  if (isOnboardingV2) {
    return (
      <ModalContent isVerticallyCentered isHorizontallyCentered>
        <SignInUpWorkspaceActivationV2Effect />
        <SignInUpWorkspaceActivationV2 />
      </ModalContent>
    );
  }

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <Logo
        primaryLogo={
          isNonEmptyString(currentWorkspace?.logo)
            ? currentWorkspace?.logo
            : undefined
        }
      />
      <Title>
        <Trans>Creating your workspace</Trans>
      </Title>
      <StyledActivationStep>
        {activationStep === 'database' && (
          <SubTitle>
            <Trans>Setting up your database...</Trans>
          </SubTitle>
        )}
        {activationStep === 'data-model' && (
          <SubTitle>
            <Trans>Creating your data model...</Trans>
          </SubTitle>
        )}
        {activationStep === 'prefill' && (
          <SubTitle>
            <Trans>Prefilling your workspace data...</Trans>
          </SubTitle>
        )}
      </StyledActivationStep>
      <StyledLoaderContainer>
        <Loader color="gray" />
      </StyledLoaderContainer>
    </ModalContent>
  );
};
