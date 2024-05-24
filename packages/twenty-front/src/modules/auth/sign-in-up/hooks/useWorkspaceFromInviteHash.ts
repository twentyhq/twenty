import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { useGetWorkspaceFromInviteHashQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useWorkspaceFromInviteHash = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setIsDefaultLayoutAuthModalVisibleState = useSetRecoilState(
    isDefaultLayoutAuthModalVisibleState,
  );
  const { data: workspaceFromInviteHash, loading } =
    useGetWorkspaceFromInviteHashQuery({
      variables: { inviteHash: workspaceInviteHash || '' },
      onError: () => {
        enqueueSnackBar('workspace does not exist', {
          variant: SnackBarVariant.Error,
        });
        navigate(AppPath.Index);
      },
      onCompleted: (data) => {
        if (
          isDefined(currentWorkspace) &&
          currentWorkspace.id === data?.findWorkspaceFromInviteHash?.id
        ) {
          enqueueSnackBar(
            `You already belong to ${data?.findWorkspaceFromInviteHash?.displayName} workspace`,
            {
              variant: SnackBarVariant.Info,
            },
          );
          navigate(AppPath.Index);
        } else {
          setIsDefaultLayoutAuthModalVisibleState(true);
        }
      },
    });
  return {
    workspace: workspaceFromInviteHash?.findWorkspaceFromInviteHash,
    workspaceInviteHash,
    loading,
  };
};
