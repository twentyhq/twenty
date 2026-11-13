import { useStore } from 'jotai';
import { useCallback } from 'react';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useCaptureAgentChatSession = () => {
  const store = useStore();

  const captureAgentChatSession = useCallback(() => {
    const workspaceId = store.get(currentWorkspaceState.atom)?.id;
    const userWorkspace = store.get(currentUserWorkspaceState.atom);
    const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;

    return {
      isSameSession: () =>
        store.get(currentWorkspaceState.atom)?.id === workspaceId &&
        store.get(currentWorkspaceMemberState.atom)?.id === workspaceMemberId &&
        store.get(currentUserWorkspaceState.atom) === userWorkspace,
    };
  }, [store]);

  return { captureAgentChatSession };
};
