import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { AppPath } from '@/types/AppPath';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useGetWorkspaceFromInviteHashQuery } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useWorkspaceFromInviteHash = () => {
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [initiallyLoggedIn] = useState(isDefined(currentWorkspace));

  const { data: workspaceFromInviteHash, loading } =
    useGetWorkspaceFromInviteHashQuery({
      skip: !workspaceInviteHash,
      variables: { inviteHash: workspaceInviteHash || '' },
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
        navigate(AppPath.Index);
      },
      onCompleted: (data) => {
        if (
          isDefined(currentWorkspace) &&
          data?.findWorkspaceFromInviteHash &&
          currentWorkspace.id === data.findWorkspaceFromInviteHash.id
        ) {
          initiallyLoggedIn &&
            enqueueInfoSnackBar({
              message: t`You already belong to ${data?.findWorkspaceFromInviteHash?.displayName} workspace`,
            });
          navigate(AppPath.Index);
        }
      },
    });
  return {
    workspace: workspaceFromInviteHash?.findWorkspaceFromInviteHash,
    workspaceInviteHash,
    loading,
  };
};
