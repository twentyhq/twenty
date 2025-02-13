import { useMutation } from '@apollo/client';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { CreateTelephonyInput } from '../types/SettingsServiceCenterTelephony';
import { CREATE_TELEPHONY } from '../graphql/mutations/createTelephony';

interface UserCreateTelephonyReturn {
  createTelephony: (inputTelephony: CreateTelephonyInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateTelephony = (): UserCreateTelephonyReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [createTelephonyMutation, { data, loading, error }] = useMutation(
    CREATE_TELEPHONY,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Telephony extension added successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const createTelephony = async (
    createTelephonyInput: CreateTelephonyInput,
  ) => {
    try {
      await createTelephonyMutation({
        variables: { createTelephonyInput: createTelephonyInput },
      });
    } catch (err) {
      enqueueSnackBar('Telephony creation error', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    createTelephony,
    data,
    loading,
    error,
  };
};
