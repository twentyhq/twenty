// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_URAS } from '@/settings/service-center/telephony/graphql/queries/getAllURAs';
import { Campaign } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllURAsReturn = {
  uras: Campaign[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllUras = (): UseFindAllURAsReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data, loading, refetch } = useQuery(GET_ALL_URAS, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    variables: {
      workspaceId: currentWorkspace?.id,
    },
  });

  return {
    uras: data?.getTelephonyURAs,
    loading,
    refetch,
  };
};
