import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useToast } from 'twenty-ui/feedback';

import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { GetWorkspaceFromInviteHashDocument } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useWorkspaceFromInviteHash = () => {
  const { enqueueErrorToast } = useErrorToast();
  const { enqueueToast } = useToast();
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
      enqueueErrorToast(error);
      navigate(AppPath.Index);
    }
  }, [error, enqueueErrorToast, navigate]);

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
        enqueueToast({
          variant: 'info',
          children: workspaceDisplayName
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
    enqueueToast,
    navigate,
  ]);
  return {
    workspace: workspaceFromInviteHash?.findWorkspaceFromInviteHash,
    workspaceInviteHash,
    loading,
  };
};
