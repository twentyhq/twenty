import { useLingui } from '@lingui/react/macro';

import { type AiChatThreadDisplayIdentity } from '@/ai/types/AgentChatThreadDisplayIdentity';
import { getAiChatThreadDisplayLabel } from '@/ai/utils/getAgentChatThreadDisplayLabel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatThreadDisplayLabel = ({
  thread,
  fallbackLabel,
}: {
  thread: AiChatThreadDisplayIdentity | null | undefined;
  fallbackLabel: string;
}) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  return getAiChatThreadDisplayLabel({
    thread,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    workspaceMembers: currentWorkspaceMembers,
    fallbackLabel,
    formerMemberLabel: t`Former member`,
  });
};
