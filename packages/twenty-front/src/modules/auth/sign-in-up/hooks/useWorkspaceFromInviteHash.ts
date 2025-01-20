import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';

import { AppPath } from '@/types/AppPath';
import { useGetWorkspaceFromInviteHashQuery } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isDefined } from '~/utils/isDefined';

export const useWorkspaceFromInviteHash = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [initiallyLoggedIn] = useState(isDefined(currentWorkspace));
  const setIsDefaultLayoutAuthModalVisible = useSetRecoilState(
    isDefaultLayoutAuthModalVisibleState,
  );
  const { data: workspaceFromInviteHash, loading } =
    useGetWorkspaceFromInviteHashQuery({
      variables: { inviteHash: workspaceInviteHash || '' },
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
        navigate(AppPath.Index);
      },
      onCompleted: (data) => {
        if (
          isDefined(currentWorkspace) &&
          data?.findWorkspaceFromInviteHash &&
          currentWorkspace.id === data.findWorkspaceFromInviteHash.id
        ) {
          initiallyLoggedIn &&
            enqueueSnackBar(
              `You already belong to ${data?.findWorkspaceFromInviteHash?.displayName} workspace`,
              {
                variant: SnackBarVariant.Info,
              },
            );
          navigate(AppPath.Index);
        } else {
          setIsDefaultLayoutAuthModalVisible(true);
        }
      },
    });
  return {
    workspace: workspaceFromInviteHash?.findWorkspaceFromInviteHash,
    workspaceInviteHash,
    loading,
  };
};
