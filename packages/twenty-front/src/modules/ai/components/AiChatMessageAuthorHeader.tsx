import { useLingui } from '@lingui/react/macro';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { ChatMessageHeader } from '@/chat/components/ChatMessageHeader';
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
  sender: PartialWorkspaceMember | undefined;
  messageId: string;
  createdAt: Date | string;
};

export const AiChatMessageAuthorHeader = ({
  metadata,
  sender,
  messageId,
  createdAt,
}: AiChatMessageAuthorHeaderProps) => {
  const { t } = useLingui();
  const { displayName: assistantDisplayName } = useAiChatAssistantProfile();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  if (metadata?.isBuiltInAssistant === true) {
    return (
      <ChatMessageHeader
        avatar={<AiChatAssistantAvatar />}
        name={assistantDisplayName}
        createdAt={createdAt}
      />
    );
  }

  const applicationId = metadata?.senderApplicationId;

  if (isDefined(applicationId)) {
    return (
      <ChatMessageHeader
        avatar={<AppChip applicationId={applicationId} chipOnly rounded />}
        name={getInstalledApplicationDisplayName({
          applicationId,
          currentWorkspace,
        })}
        createdAt={createdAt}
      />
    );
  }

  const senderId = metadata?.senderWorkspaceMemberId;
  const agentId = metadata?.agentId;
  const authorName = isDefined(senderId)
    ? getAgentChatSenderLabel({ sender, isCurrentWorkspaceMember: false })
    : isDefined(agentId)
      ? t`Agent`
      : t`Unknown sender`;

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
    />
  );
};
