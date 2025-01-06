import { DELETE_ROLE_BY_ID } from '@/settings/roles/graphql/mutations/deleteRole';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseDeleteRoleByIdReturn {
  deleteRoleById: (roleId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useDeleteRole = (): UseDeleteRoleByIdReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [deleteRoleMutation, { loading, error }] = useMutation(
    DELETE_ROLE_BY_ID,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Role deleted successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const deleteRoleById = async (roleId: string) => {
    try {
      await deleteRoleMutation({
        variables: { roleId },
      });
    } catch (err) {
      enqueueSnackBar('Error deleting role', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    deleteRoleById,
    loading,
    error,
  };
};
