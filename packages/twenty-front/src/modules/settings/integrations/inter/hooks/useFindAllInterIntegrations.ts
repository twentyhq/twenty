import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_INTER_INTEGRATIONS } from '@/settings/integrations/inter/graphql/query/interIntegrationByWorkspace';
import { FindInterIntegration } from '@/settings/integrations/inter/types/FindInterIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type FindAllInterIntegrations = {
  interIntegrations: FindInterIntegration[];
  refetchInter: () => void;
  loading: boolean;
};

export const useFindAllInterIntegrations = (): FindAllInterIntegrations => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data,
    refetch: refetchInter,
    loading,
  } = useQuery(GET_ALL_INTER_INTEGRATIONS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    interIntegrations: data?.interIntegrationsByWorkspace,
    refetchInter,
    loading,
  };
};
