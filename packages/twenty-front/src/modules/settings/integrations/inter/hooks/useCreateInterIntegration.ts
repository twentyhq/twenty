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
    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

    const privateKeyContent = input.privateKey
      ? await toBase64(input.privateKey as File)
      : null;

    const certificateContent = input.certificate
      ? await toBase64(input.certificate as File)
      : null;

    const createInput = {
      ...input,
      workspaceId: currentWorkspace?.id,
      privateKey: privateKeyContent,
      certificate: certificateContent,
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
