import { UPDATE_WHATSAPP_INTEGRATION } from '@/settings/integrations/meta/whatsapp/graphql/mutation/updateWhatsappIntegration';
import { UpdateWhatsappIntegrationInput } from '@/settings/integrations/meta/whatsapp/types/UpdateWhatsappIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UpdateWhatsappIntegration {
  updateWhatsappIntegration: (
    updateInput: UpdateWhatsappIntegrationInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateWhatsappIntegration = (): UpdateWhatsappIntegration => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateWhatsappIntegrationMutation, { loading, error }] = useMutation(
    UPDATE_WHATSAPP_INTEGRATION,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Whatsapp integration updated successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const updateWhatsappIntegration = async (
    updateInput: UpdateWhatsappIntegrationInput,
  ) => {
    try {
      await updateWhatsappIntegrationMutation({
        variables: {
          updateInput,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating role', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    updateWhatsappIntegration: updateWhatsappIntegration,
    loading,
    error,
  };
};
