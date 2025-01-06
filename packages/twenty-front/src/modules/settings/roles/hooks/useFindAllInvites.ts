import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_INVITED_MEMBERS } from '@/settings/roles/graphql/queries/getAllInvitedMembers';
import { InvitedMember } from '@/settings/roles/types/InvitedMember';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type UseFindAllInvitedMembersReturn = {
  invites: InvitedMember[];
  refetch: () => void;
};

export const useFindAllInvitedMembers = (): UseFindAllInvitedMembersReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data, refetch } = useQuery(GET_ALL_INVITED_MEMBERS, {
    variables: { workspaceId: currentWorkspace?.id },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    invites: data?.getAllInvitedMembers || [],
    refetch,
  };
};
