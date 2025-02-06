import { useMutation } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CREATE_WHATSAPP_INTEGRATION } from '@/settings/integrations/meta/whatsapp/graphql/mutation/createWhatsappIntegration';
import { CreateWhatsappIntegrationInput } from '@/settings/integrations/meta/whatsapp/types/CreateWhatsappIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

interface CreateWhatsappIntegration {
  createWhatsappIntegration: (
    input: CreateWhatsappIntegrationInput,
  ) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateWhatsappIntegration = (): CreateWhatsappIntegration => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const [createWhatsappIntegrationMutation, { data, loading, error }] =
    useMutation(CREATE_WHATSAPP_INTEGRATION, {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Whatsapp integration created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    });

  const createWhatsappIntegration = async (
    input: CreateWhatsappIntegrationInput,
  ) => {
    const createInput = {
      ...input,
      workspaceId: currentWorkspace?.id,
    };

    await createWhatsappIntegrationMutation({
      variables: {
        createInput,
      },
    });
  };

  return {
    createWhatsappIntegration,
    data,
    loading,
    error,
  };
};
