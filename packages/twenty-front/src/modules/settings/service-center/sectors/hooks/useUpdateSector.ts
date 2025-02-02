import { UPDATE_SECTOR } from '@/settings/service-center/sectors/graphql/mutation/updateSector';
import { UpdateSectorInput } from '@/settings/service-center/sectors/types/UpdateSectorInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseToggleSectorActiveReturn {
  editSector: (updateInput: UpdateSectorInput) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateSector = (): UseToggleSectorActiveReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateSector, { loading, error }] = useMutation(UPDATE_SECTOR, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: () => {
      enqueueSnackBar('Sector updated successfully!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  const editSector = async (updateInput: UpdateSectorInput) => {
    try {
      await updateSector({
        variables: {
          updateInput,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating sector', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    loading,
    error,
    editSector,
  };
};
