import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useGetWorkspaceFromInviteHashQuery } from '~/generated-metadata/graphql';
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
          const workspaceDisplayName =
            data?.findWorkspaceFromInviteHash?.displayName;
          initiallyLoggedIn &&
            enqueueInfoSnackBar({
              message: workspaceDisplayName
                ? t`You already belong to the workspace ${workspaceDisplayName}`
                : t`You already belong to this workspace`,
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
