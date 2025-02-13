// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dids } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { GET_ALL_DIDS } from '@/settings/service-center/telephony/graphql/queries/getAllDids';

type UseFindAllDidsReturn = {
  dids: Dids[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllDids = (): UseFindAllDidsReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, refetch } = useQuery(GET_ALL_DIDS, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    dids: data?.getTelephonyDids,
    loading,
    refetch,
  };
};
