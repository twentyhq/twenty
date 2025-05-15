// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_CALLFLOWS } from '@/settings/service-center/telephony/graphql/queries/getAllCallFlows';
import { TelephonyCallFlow } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllCallFlowReturn = {
  callFlows: TelephonyCallFlow[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllCallFlows = (): UseFindAllCallFlowReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data, loading, refetch } = useQuery(GET_ALL_CALLFLOWS, {
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
    callFlows: data?.getTelephonyCallFlows,
    loading,
    refetch,
  };
};
