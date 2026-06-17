import { useCallback, useState } from 'react';

import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { ActivateWorkspaceDocument } from '~/generated-metadata/graphql';

export enum PendingCreationLoaderStep {
  None = 'none',
  Step1 = 'step-1',
  Step2 = 'step-2',
  Step3 = 'step-3',
}

type ActivateWorkspaceArgs = {
  displayName: string;
};

export const useActivateWorkspaceOnboarding = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { loadCurrentUser } = useLoadCurrentUser();
  const [activateWorkspaceMutation] = useMutation(ActivateWorkspaceDocument);
  const [pendingCreationLoaderStep, setPendingCreationLoaderStep] = useState(
    PendingCreationLoaderStep.None,
  );

  const activateWorkspace = useCallback(
    async ({ displayName }: ActivateWorkspaceArgs) => {
      try {
        setTimeout(() => {
          setPendingCreationLoaderStep(PendingCreationLoaderStep.Step1);
        }, 500);
        setTimeout(() => {
          setPendingCreationLoaderStep(PendingCreationLoaderStep.Step2);
        }, 2000);
        setTimeout(() => {
          setPendingCreationLoaderStep(PendingCreationLoaderStep.Step3);
        }, 5000);

        const result = await activateWorkspaceMutation({
          variables: {
            input: {
              displayName,
            },
          },
        });

        if (isDefined(result.error)) {
          throw result.error ?? new Error(t`Unknown error`);
        }

        await loadCurrentUser();
        setNextOnboardingStatus();
      } catch (error: any) {
        setPendingCreationLoaderStep(PendingCreationLoaderStep.None);

        enqueueErrorSnackBar({
          apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
        });
      }
    },
    [
      activateWorkspaceMutation,
      enqueueErrorSnackBar,
      loadCurrentUser,
      setNextOnboardingStatus,
      t,
    ],
  );

  return {
    pendingCreationLoaderStep,
    activateWorkspace,
  };
};
