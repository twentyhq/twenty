// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_DIALING_PLANS } from '@/settings/service-center/telephony/graphql/queries/getAllDialingPlans';
import { DialingPlans } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllDialingPlansReturn = {
  dialingPlans: DialingPlans[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllDialingPlans = (): UseFindAllDialingPlansReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: telephonysData,
    loading,
    refetch,
  } = useQuery(GET_ALL_DIALING_PLANS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    dialingPlans: telephonysData?.getTelephonyPlans,
    loading,
    refetch,
  };
};
