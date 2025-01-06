import { useQuery } from '@apollo/client';

import { GET_ONE_ROLE } from '@/settings/roles/graphql/queries/getOneRole';
import { Role } from '@/settings/roles/types/Role';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type UseFindOneRoleReturn = {
  role: Role | null;
  loading: boolean;
  refetch: () => void;
};

export const useFindRoleById = (roleId: string): UseFindOneRoleReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const {
    data: roleData,
    loading,
    refetch,
  } = useQuery(GET_ONE_ROLE, {
    variables: { roleId },
    // Return 'Role id not found', even if there is a roleId
    // comes from packages/twenty-server/src/engine/core-modules/role/role.resolver.ts
    onError: (error) => {
      // enqueueSnackBar(error.message, {
      //   variant: SnackBarVariant.Error,
      // });
    },
  });

  return {
    role: roleData?.findOneRole || null,
    loading,
    refetch,
  };
};
