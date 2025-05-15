import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/query/getFocusNfeIntegrationsByWorkspace';
import { FindInterIntegration } from '@/settings/integrations/inter/types/FindInterIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type GetAllFocusNfeIntegrationsByWorkspace = {
  focusNfeIntegrations: FindInterIntegration[];
  refetchFocusNfe: () => void;
  loading: boolean;
};

export const useGetAllFocusNfeIntegrationsByWorkspace =
  (): GetAllFocusNfeIntegrationsByWorkspace => {
    const { enqueueSnackBar } = useSnackBar();
    const currentWorkspace = useRecoilValue(currentWorkspaceState);

    const {
      data,
      refetch: refetchFocusNfe,
      loading,
    } = useQuery(GET_FOCUS_NFE_INTEGRATIONS_BY_WORKSPACE, {
      variables: { workspaceId: currentWorkspace?.id },
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
    });
    return {
      focusNfeIntegrations: data?.getFocusNfeIntegrationsByWorkspace,
      refetchFocusNfe,
      loading,
    };
  };
