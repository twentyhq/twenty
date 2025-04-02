import { UPDATE_INTER_INTEGRATION } from '@/settings/integrations/inter/graphql/mutation/updateInterIntegration';
import { UpdateInterIntegrationInput } from '@/settings/integrations/inter/types/UpdateInterIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UpdateInterIntegration {
  updateInterIntegration: (
    updateInput: UpdateInterIntegrationInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateInterIntegration = (): UpdateInterIntegration => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateInterIntegrationMutation, { loading, error }] = useMutation(
    UPDATE_INTER_INTEGRATION,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Inter integration updated successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const updateInterIntegration = async (
    updateInput: UpdateInterIntegrationInput,
  ) => {
    try {
      await updateInterIntegrationMutation({
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
    updateInterIntegration: updateInterIntegration,
    loading,
    error,
  };
};
