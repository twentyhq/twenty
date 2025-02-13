// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Campaign } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { GET_ALL_URAS } from '@/settings/service-center/telephony/graphql/queries/getAllURAs';

type UseFindAllURAsReturn = {
  uras: Campaign[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllUras = (): UseFindAllURAsReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, refetch } = useQuery(GET_ALL_URAS, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    uras: data?.getTelephonyURAs,
    loading,
    refetch,
  };
};
