import { styled } from '@linaria/react';
import { useCallback, useEffect, useState } from 'react';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ModalContent } from 'twenty-ui/layout';
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

// The workspace name (and optional logo) are already collected in the shared
// creation form (Step 1). This onboarding step is now a pure activation loader:
// it activates the pending workspace on mount and surfaces a retry on failure.
export const CreateWorkspace = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { loadCurrentUser } = useLoadCurrentUser();
  const [activateWorkspace] = useMutation(ActivateWorkspaceDocument);
  const [activationStep, setActivationStep] =
    useState<ActivationStep>('pending');
  const [hasFailed, setHasFailed] = useState(false);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const displayName = currentWorkspace?.displayName;

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
          input: {
            displayName,
          },
        },
      });

      if (isDefined(result.error)) {
        throw result.error;
      }

      await loadCurrentUser();
      setNextOnboardingStatus();
    } catch (error) {
      clearStepTimeouts();
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
    displayName,
    enqueueErrorSnackBar,
    loadCurrentUser,
    setNextOnboardingStatus,
  ]);

  // The workspace name is always set by the time we reach this step, so we
  // activate unconditionally on mount. Activation is an imperative one-time
  // action, so a mount effect is the right tool here.
  const [hasTriggered, setHasTriggered] = useState(false);
  useEffect(() => {
    if (hasTriggered) {
      return;
    }

    setHasTriggered(true);
    void activate();
  }, [activate, hasTriggered]);

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
        {hasFailed ? (
          <Trans>Workspace creation failed</Trans>
        ) : (
          <Trans>Creating your workspace</Trans>
        )}
      </Title>
      {hasFailed ? (
        <>
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
              fullWidth
            />
          </StyledButtonContainer>
        </>
      ) : (
        <>
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
        </>
      )}
    </ModalContent>
  );
};
