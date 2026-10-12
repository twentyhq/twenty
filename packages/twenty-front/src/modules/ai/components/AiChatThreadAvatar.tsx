import { useLingui } from '@lingui/react/macro';

import { useAgentChatThreadMembers } from '@/ai/hooks/useAgentChatThreadMembers';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { WorkspaceMemberAvatarStack } from '@/workspace-member/components/WorkspaceMemberAvatarStack';

type AiChatThreadAvatarProps = {
  thread: AgentChatThreadRecord;
};

export const AiChatThreadAvatar = ({ thread }: AiChatThreadAvatarProps) => {
  const { t } = useLingui();
  const threadMembers = useAgentChatThreadMembers(thread);

  return (
    <WorkspaceMemberAvatarStack
      workspaceMembers={threadMembers}
      defaultAvatarName={t`Member`}
      maxVisible={2}
    />
  );
};
