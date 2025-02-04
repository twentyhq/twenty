// packages/twenty-front/src/modules/roles/hooks/useAllRoles.ts
import { useQuery } from '@apollo/client';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_AGENTS } from '@/settings/service-center/agents/graphql/query/agentsByWorkspace';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';

type UseFindAllAgentsReturn = {
  agents: Agent[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllAgents = (): UseFindAllAgentsReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: agentsData,
    loading,
    refetch,
  } = useQuery(GET_ALL_AGENTS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    agents: agentsData?.agentsByWorkspace,
    loading,
    refetch,
  };
};
