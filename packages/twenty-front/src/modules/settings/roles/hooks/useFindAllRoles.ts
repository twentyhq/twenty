// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_ROLES } from '@/settings/roles/graphql/queries/getAllRoles';
import { Role } from '@/settings/roles/types/Role';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllRolesReturn = {
  roles: Role[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllRoles = (): UseFindAllRolesReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: rolesData,
    loading,
    refetch,
  } = useQuery(GET_ALL_ROLES, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    roles: rolesData?.findAllRoles,
    loading,
    refetch,
  };
};
