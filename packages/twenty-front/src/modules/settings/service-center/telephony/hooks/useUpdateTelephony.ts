import { useMutation } from '@apollo/client';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { UPDATE_TELEPHONY } from '@/settings/service-center/telephony/graphql/mutations/updateAgent';
import { UpdateTelephonyInput } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';

interface UseEditTelephonyReturn {
  editTelephony: (
    id: string,
    updateTelephonyInput: UpdateTelephonyInput,
  ) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateTelephony = (): UseEditTelephonyReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateTelephony, { loading, error }] = useMutation(UPDATE_TELEPHONY, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: () => {
      enqueueSnackBar('Agent updated successfully!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  const editTelephony = async (
    id: string,
    updateTelephonyInput: UpdateTelephonyInput,
  ) => {
    try {
      await updateTelephony({
        variables: {
          id,
          updateTelephonyInput,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating agent', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    loading,
    error,
    editTelephony,
  };
};
