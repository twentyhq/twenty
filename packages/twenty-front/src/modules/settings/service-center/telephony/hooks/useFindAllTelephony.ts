// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { GET_ALL_TELEPHONYS } from '@/settings/service-center/telephony/graphql/queries/getAllTelephonys';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';

type UseFindAllTelephonyReturn = {
  telephonys: Telephony[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllTelephonys = (): UseFindAllTelephonyReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: telephonysData,
    loading,
    refetch,
  } = useQuery(GET_ALL_TELEPHONYS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    telephonys: telephonysData?.findAllTelephony,
    loading,
    refetch,
  };
};
