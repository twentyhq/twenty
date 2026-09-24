import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';

const REFRESH_INTERVAL_MS = 30_000;

export const AgentChatThreadsRefreshEffect = () => {
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { refreshAgentChatThreads } = useRefreshAgentChatThreads();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void refreshAgentChatThreads();
      }
    };
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [refreshAgentChatThreads, currentUserWorkspace, currentWorkspaceMember]);

  return null;
};
