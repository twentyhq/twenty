import { useMutation } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CREATE_INTER_INTEGRATION } from '@/settings/integrations/inter/graphql/mutation/createInterIntegration';
import { CreateInterIntegrationInput } from '@/settings/integrations/inter/types/CreateInterIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

interface CreateInterIntegration {
  createInterIntegration: (input: CreateInterIntegrationInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateInterIntegration = (): CreateInterIntegration => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const [createInterIntegrationMutation, { data, loading, error }] =
    useMutation(CREATE_INTER_INTEGRATION, {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Inter integration created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    });

  const createInterIntegration = async (input: CreateInterIntegrationInput) => {
    const createInput = {
      ...input,
      workspaceId: currentWorkspace?.id,
    };

    await createInterIntegrationMutation({
      variables: {
        createInput,
      },
    });
  };

  return {
    createInterIntegration,
    data,
    loading,
    error,
  };
};
