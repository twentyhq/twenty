import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Logo } from '@/auth/components/Logo';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { SignInUpWorkspaceCreationLoader } from '@/auth/sign-in-up/components/SignInUpWorkspaceCreationLoader';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  background: ${themeCssVariables.background.primary};
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

export const WorkspaceActivationV2 = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { loadCurrentUser } = useLoadCurrentUser();
  const [activateWorkspace, { loading: isActivating }] = useMutation(
    ActivateWorkspaceDocument,
  );
  const [hasFailed, setHasFailed] = useState(false);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const activate = useCallback(async () => {
    setHasFailed(false);

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
      setHasFailed(true);

      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
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

  if (!hasFailed) {
    return (
      <StyledContainer>
        <SignInUpWorkspaceCreationLoader />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
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
          Something went wrong while creating your workspace. Please try again.
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
    </StyledContainer>
  );
};
