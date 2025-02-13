// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TelephonyExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { GET_ALL_PABX } from '@/settings/service-center/telephony/graphql/queries/getAllPABX';

type UseFindAllPABXReturn = {
  telephonyExtensions: TelephonyExtension[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllPABX = (): UseFindAllPABXReturn => {
  const { enqueueSnackBar } = useSnackBar();
  // const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: telephonysData,
    loading,
    refetch,
  } = useQuery(GET_ALL_PABX, {
    // variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    telephonyExtensions: telephonysData?.getAllExtensions,
    loading,
    refetch,
  };
};
