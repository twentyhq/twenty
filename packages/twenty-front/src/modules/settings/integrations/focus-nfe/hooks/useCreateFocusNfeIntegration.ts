import { useMutation } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CREATE_FOCUS_NFE_INTEGRATION } from '@/settings/integrations/focus-nfe/graphql/mutation/createFocusNfeIntegration';
import { CreateInterIntegrationInput } from '@/settings/integrations/inter/types/CreateInterIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

interface CreateFocusNfeIntegration {
  // createFocusNfeIntegration: (
  //   input: CreateFocusNfeIntegrationInput,
  // ) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateFocusNfeIntegration = (): CreateFocusNfeIntegration => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const [createFocusNfeIntegrationMutation, { data, loading, error }] =
    useMutation(CREATE_FOCUS_NFE_INTEGRATION, {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Focus NFe integration created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    });

  const createFocusNfeIntegration = async (
    input: CreateInterIntegrationInput,
  ) => {
    const createInput = {
      ...input,
      workspaceId: currentWorkspace?.id,
    };

    await createFocusNfeIntegrationMutation({
      variables: {
        createInput,
      },
    });
  };

  return {
    // createFocusNfeIntegration,
    data,
    loading,
    error,
  };
};
