import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_INBOXES } from '@/settings/service-center/inboxes/graphql/inboxesByWorkspace';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

type UseFindAllInboxesReturn = {
  inboxes: Inbox[];
  loading: boolean;
  refetch: () => void;
};

export const useFindAllInboxes = (): UseFindAllInboxesReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const {
    data: inboxesData,
    loading,
    refetch,
  } = useQuery(GET_ALL_INBOXES, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    inboxes: inboxesData?.inboxesByWorkspace,
    loading,
    refetch,
  };
};
