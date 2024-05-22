import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { workspaceInviteHashVerificationState } from '@/auth/states/workspaceInviteHashVerificationState';
import { TokenVerificationType } from '@/auth/types/tokenVerificationType';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useGetWorkspaceFromInviteHashQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useWorkspaceFromInviteHash = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setWorkspaceInviteHashVerification = useSetRecoilState(
    workspaceInviteHashVerificationState,
  );
  const { data: workspaceFromInviteHash, loading } =
    useGetWorkspaceFromInviteHashQuery({
      variables: { inviteHash: workspaceInviteHash || '' },
      onError: () => {
        setWorkspaceInviteHashVerification(TokenVerificationType.Invalid);
        enqueueSnackBar('workspace does not exist', {
          variant: 'error',
        });
        navigate(AppPath.Index);
      },
      onCompleted: (data) => {
        if (
          isDefined(currentWorkspace) &&
          currentWorkspace.id === data?.findWorkspaceFromInviteHash?.id
        ) {
          setWorkspaceInviteHashVerification(TokenVerificationType.Invalid);
          enqueueSnackBar(
            `You already belong to ${data?.findWorkspaceFromInviteHash?.displayName} workspace`,
            {
              variant: 'info',
            },
          );
          navigate(AppPath.Index);
        } else {
          setWorkspaceInviteHashVerification(TokenVerificationType.Valid);
        }
      },
    });
  return {
    workspace: workspaceFromInviteHash?.findWorkspaceFromInviteHash,
    workspaceInviteHash,
    loading,
  };
};
