import { useLingui } from '@lingui/react/macro';

import { type AgentChatThreadDisplayIdentity } from '@/ai/types/AgentChatThreadDisplayIdentity';
import { getAgentChatThreadDisplayLabel } from '@/ai/utils/getAgentChatThreadDisplayLabel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatThreadDisplayLabel = ({
  thread,
  fallbackLabel,
}: {
  thread: AgentChatThreadDisplayIdentity | null | undefined;
  fallbackLabel: string;
}) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  return getAgentChatThreadDisplayLabel({
    thread,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    workspaceMembers: currentWorkspaceMembers,
    fallbackLabel,
    formerMemberLabel: t`Former member`,
  });
};
