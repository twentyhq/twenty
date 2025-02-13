// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TelephonyCallFlow } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { GET_ALL_CALLFLOWS } from '@/settings/service-center/telephony/graphql/queries/getAllCallFlows';

type UseFindAllCallFlowReturn = {
  callFlows: TelephonyCallFlow[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllCallFlows = (): UseFindAllCallFlowReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, refetch } = useQuery(GET_ALL_CALLFLOWS, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    callFlows: data?.getTelephonyCallFlows,
    loading,
    refetch,
  };
};
