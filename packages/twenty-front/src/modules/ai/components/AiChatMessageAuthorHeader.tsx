import { useLingui } from '@lingui/react/macro';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { AiChatAgentMessageHeader } from '@/ai/components/AiChatAgentMessageHeader';
import { AiChatMessageHeader } from '@/ai/components/AiChatMessageHeader';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type AiChatMessageAuthorHeaderProps = {
  metadata: ExtendedUIMessage['metadata'];
  role: ExtendedUIMessage['role'];
  messageId: string;
  createdAt: Date | string;
};

export const AiChatMessageAuthorHeader = ({
  metadata,
  role,
  messageId,
  createdAt,
}: AiChatMessageAuthorHeaderProps) => {
  const { t } = useLingui();
  const assistantProfile = useAiChatAssistantProfile();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const applicationId = metadata?.senderApplicationId;
  const senderId = metadata?.senderWorkspaceMemberId;
  const agentId = metadata?.agentId;
  const isBuiltInAssistant =
    metadata?.isBuiltInAssistant &&
    !isDefined(applicationId) &&
    !isDefined(senderId) &&
    !isDefined(agentId);

  if (isBuiltInAssistant) {
    return (
      <AiChatMessageHeader
        avatar={<AiChatAssistantAvatar />}
        name={assistantProfile.displayName}
        createdAt={createdAt}
      />
    );
  }

  if (isDefined(agentId) && !isDefined(applicationId) && !isDefined(senderId)) {
    return <AiChatAgentMessageHeader agentId={agentId} createdAt={createdAt} />;
  }

  const application = currentWorkspace?.installedApplications.find(
    ({ id }) => id === applicationId,
  );
  const sender = currentWorkspaceMembers.find(({ id }) => id === senderId);
  const getAuthorName = () => {
    if (isDefined(applicationId)) {
      return application?.name ?? t`Application`;
    }

    if (isDefined(senderId)) {
      return getAgentChatSenderLabel({
        sender,
        isCurrentWorkspaceMember: false,
      });
    }

    return role === AGENT_MESSAGE_ROLE.ASSISTANT
      ? t`Assistant`
      : t`Unknown sender`;
  };
  const authorName = getAuthorName();
  const avatarUrl = isDefined(applicationId)
    ? application?.logoUrl
    : sender?.avatarUrl;

  return (
    <AiChatMessageHeader
      avatar={
        <Avatar
          src={getAbsoluteImageUrl(avatarUrl)}
          colorSeed={applicationId ?? senderId ?? agentId ?? messageId}
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
