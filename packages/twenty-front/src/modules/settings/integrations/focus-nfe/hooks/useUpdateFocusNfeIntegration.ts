import { UPDATE_FOCUS_NFE_INTEGRATION } from '@/settings/integrations/focus-nfe/graphql/mutation/updateFocusNfeIntegration';
import { UpdateFocusNfeIntegrationInput } from '@/settings/integrations/focus-nfe/types/UpdateFocusNfeIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UpdateFocusNfeIntegration {
  updateFocusNfeIntegration: (
    updateInput: UpdateFocusNfeIntegrationInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateFocusNfeIntegration = (): UpdateFocusNfeIntegration => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateFocusNfeIntegrationMutation, { loading, error }] = useMutation(
    UPDATE_FOCUS_NFE_INTEGRATION,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Focus NFe integration updated successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const updateFocusNfeIntegration = async (
    updateInput: UpdateFocusNfeIntegrationInput,
  ) => {
    const input = {
      ...updateInput,
    };

    try {
      await updateFocusNfeIntegrationMutation({
        variables: {
          updateInput: input,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating role', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    updateFocusNfeIntegration: updateFocusNfeIntegration,
    loading,
    error,
  };
};
