// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DialingPlans } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { GET_ALL_DIALING_PLANS } from '@/settings/service-center/telephony/graphql/queries/getAllDialingPlans';

type UseFindAllDialingPlansReturn = {
  dialingPlans: DialingPlans[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllDialingPlans = (): UseFindAllDialingPlansReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const {
    data: telephonysData,
    loading,
    refetch,
  } = useQuery(GET_ALL_DIALING_PLANS, {
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
