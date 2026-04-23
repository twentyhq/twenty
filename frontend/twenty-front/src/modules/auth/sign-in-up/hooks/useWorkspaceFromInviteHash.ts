import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useQuery } from '@apollo/client/react';
import { GetWorkspaceFromInviteHashDocument } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useWorkspaceFromInviteHash = () => {
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [initiallyLoggedIn] = useState(isDefined(currentWorkspace));
  const [hasRedirected, setHasRedirected] = useState(false);

  const {
    data: workspaceFromInviteHash,
    loading,
    error,
  } = useQuery(GetWorkspaceFromInviteHashDocument, {
    skip: !workspaceInviteHash,
    variables: { inviteHash: workspaceInviteHash || '' },
  });

  useEffect(() => {
    if (error) {
      enqueueErrorSnackBar({ apolloError: error });
      navigate(AppPath.Index);
    }
  }, [error, enqueueErrorSnackBar, navigate]);

  // TODO: Rework this useEffect - Charles will refactor as part of auth rework
  useEffect(() => {
    if (!workspaceFromInviteHash || hasRedirected) return;

    const inviteWorkspace = workspaceFromInviteHash.findWorkspaceFromInviteHash;

    if (
      isDefined(currentWorkspace) &&
      isDefined(inviteWorkspace) &&
      currentWorkspace.id === inviteWorkspace.id
    ) {
      setHasRedirected(true);
      const workspaceDisplayName = inviteWorkspace.displayName;
      initiallyLoggedIn &&
        enqueueInfoSnackBar({
          message: workspaceDisplayName
            ? t`You already belong to the workspace ${workspaceDisplayName}`
            : t`You already belong to this workspace`,
        });
      navigate(AppPath.Index);
    }
  }, [
    workspaceFromInviteHash,
    currentWorkspace,
    hasRedirected,
    initiallyLoggedIn,
    enqueueInfoSnackBar,
    navigate,
  ]);
  return {
    workspace: workspaceFromInviteHash?.findWorkspaceFromInviteHash,
    workspaceInviteHash,
    loading,
  };
};
