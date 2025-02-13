import { DELETE_SECTOR_BY_ID } from '@/settings/service-center/sectors/graphql/mutation/deleteSector';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseDeleteSectorByIdReturn {
  deleteSectorById: (sectorId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useDeleteSector = (): UseDeleteSectorByIdReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [deleteSectorMutation, { loading, error }] = useMutation(
    DELETE_SECTOR_BY_ID,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Sector deleted successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const deleteSectorById = async (sectorId: string) => {
    try {
      await deleteSectorMutation({
        variables: { sectorId },
      });
    } catch (err) {
      enqueueSnackBar('Error deleting sector', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    deleteSectorById,
    loading,
    error,
  };
};
