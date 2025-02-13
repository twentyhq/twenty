import { CREATE_SECTOR } from '@/settings/service-center/sectors/graphql/mutation/createSector';
import { CreateSectorInput } from '@/settings/service-center/sectors/types/CreateSectorInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UserCreateSectorReturn {
  createSector: (createInput: CreateSectorInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateSector = (): UserCreateSectorReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [createSectorMutation, { data, loading, error }] = useMutation(
    CREATE_SECTOR,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Sector created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const createSector = async (createInput: CreateSectorInput) => {
    try {
      await createSectorMutation({
        variables: { createInput },
      });
    } catch (err) {
      enqueueSnackBar('Sector creation error', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    createSector,
    data,
    loading,
    error,
  };
};
