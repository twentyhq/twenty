import { CREATE_ROLE } from '@/settings/roles/graphql/mutations/createRole';
import { CreateRoleInput } from '@/settings/roles/types/Role';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UserCreateRoleReturn {
  createRole: (inputRole: CreateRoleInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateRole = (): UserCreateRoleReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [createRoleMutation, { data, loading, error }] = useMutation(
    CREATE_ROLE,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Role created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const createRole = async (createRoleInput: CreateRoleInput) => {
    try {
      await createRoleMutation({
        variables: { createRoleInput },
      });
    } catch (err) {
      enqueueSnackBar('Role creation error', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    createRole,
    data,
    loading,
    error,
  };
};
