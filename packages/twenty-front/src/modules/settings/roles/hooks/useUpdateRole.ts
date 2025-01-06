import {
    TOOGLE_ROLE_ACTIVE,
    UPDATE_ROLE,
} from '@/settings/roles/graphql/mutations/updateRole';
import { UpdateRoleInput } from '@/settings/roles/types/Role';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseToggleRoleActiveReturn {
  toggleRoleActive: (roleId: string) => Promise<void>;
  editRole: (roleId: string, updateRoleInput: UpdateRoleInput) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateRole = (): UseToggleRoleActiveReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [toggleRoleActiveMutation, { loading, error }] = useMutation(
    TOOGLE_ROLE_ACTIVE,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Role updated successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const toggleRoleActive = async (roleId: string) => {
    try {
      await toggleRoleActiveMutation({
        variables: {
          roleId,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating role', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const [updateRole, { loading: loadingUpdate, error: errorUpdate }] =
    useMutation(UPDATE_ROLE, {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Role updated successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    });

  const editRole = async (id: string, updateRoleInput: UpdateRoleInput) => {
    try {
      await updateRole({
        variables: {
          updateRoleId: id,
          updateRoleInput,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating role', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    toggleRoleActive,
    loading,
    error,
    editRole,
  };
};
