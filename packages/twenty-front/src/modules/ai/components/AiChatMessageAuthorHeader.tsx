import { useLingui } from '@lingui/react/macro';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatAgentMessageHeader } from '@/ai/components/AiChatAgentMessageHeader';
import { AiChatMessageReceipt } from '@/ai/components/AiChatMessageReceipt';
import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { ChatMessageHeader } from '@/chat/components/ChatMessageHeader';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { AppChip } from '@/applications/components/AppChip';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getInstalledApplicationDisplayName } from '@/settings/app-preferences/utils/getInstalledApplicationDisplayName';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type AiChatMessageAuthorHeaderProps = {
  metadata: ExtendedUIMessage['metadata'];
  role: ExtendedUIMessage['role'];
  sender:
    | Pick<PartialWorkspaceMember, 'name' | 'userEmail' | 'avatarUrl'>
    | undefined;
  messageId: string;
  createdAt: Date | string;
};

export const AiChatMessageAuthorHeader = ({
  metadata,
  role,
  sender,
  messageId,
  createdAt,
}: AiChatMessageAuthorHeaderProps) => {
  const { t } = useLingui();
  const { displayName: assistantDisplayName } = useAiChatAssistantProfile();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const applicationId = metadata?.senderApplicationId;
  const senderId = metadata?.senderWorkspaceMemberId;
  const agentId = metadata?.agentId;
  const receipt = <AiChatMessageReceipt messageId={messageId} />;

  if (metadata?.isBuiltInAssistant === true) {
    return (
      <ChatMessageHeader
        avatar={<AiChatAssistantAvatar />}
        name={assistantDisplayName}
        createdAt={createdAt}
        receipt={receipt}
      />
    );
  }

  if (isDefined(applicationId)) {
    return (
      <ChatMessageHeader
        avatar={<AppChip applicationId={applicationId} chipOnly rounded />}
        name={getInstalledApplicationDisplayName({
          applicationId,
          currentWorkspace,
        })}
        createdAt={createdAt}
        receipt={receipt}
      />
    );
  }

  if (isDefined(agentId) && !isDefined(senderId)) {
    return (
      <AiChatAgentMessageHeader
        agentId={agentId}
        createdAt={createdAt}
        receipt={receipt}
      />
    );
  }

  const unknownAuthorName =
    role === AGENT_MESSAGE_ROLE.ASSISTANT ? t`Assistant` : t`Unknown sender`;
  const authorName = isDefined(senderId)
    ? getAgentChatSenderLabel({ sender, isCurrentWorkspaceMember: false })
    : unknownAuthorName;

  return (
    <ChatMessageHeader
      avatar={
        <Avatar
          src={getAbsoluteImageUrl(sender?.avatarUrl)}
          colorSeed={senderId ?? agentId ?? messageId}
          name={authorName}
          size="sm"
          shape="circle"
        />
      }
      name={authorName}
      createdAt={createdAt}
      receipt={receipt}
    />
  );
};
