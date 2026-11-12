import { t } from '@lingui/core/macro';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { type AgentChatMessageAuthor } from '@/ai/types/AgentChatMessageAuthor';
import { type AgentChatMessageAuthorLookup } from '@/ai/types/AgentChatMessageAuthorLookup';
import { getAgentChatAgentAuthor } from '@/ai/utils/getAgentChatAgentAuthor';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { getInstalledApplicationDisplayName } from '@/settings/app-preferences/utils/getInstalledApplicationDisplayName';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAgentChatMessageAuthor = <
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  >,
>({
  message,
  authorLookup,
  agentName,
}: {
  message: Pick<ExtendedUIMessage, 'id' | 'role' | 'metadata'>;
  authorLookup: AgentChatMessageAuthorLookup<TWorkspaceMember>;
  agentName?: string;
}): AgentChatMessageAuthor<TWorkspaceMember> => {
  const applicationId = message.metadata?.senderApplicationId;
  const senderWorkspaceMemberId = message.metadata?.senderWorkspaceMemberId;
  const agentId = message.metadata?.agentId;

  if (message.metadata?.isBuiltInAssistant) {
    return {
      type: 'builtInAssistant',
      name: authorLookup.assistantDisplayName,
      isNameResolved: true,
    };
  }

  if (isDefined(applicationId)) {
    return {
      type: 'application',
      applicationId,
      name: getInstalledApplicationDisplayName({
        applicationId,
        currentWorkspace: authorLookup.currentWorkspace,
      }),
      isNameResolved: true,
    };
  }

  if (isDefined(agentId) && !isDefined(senderWorkspaceMemberId)) {
    return getAgentChatAgentAuthor({ agentId, agentName });
  }

  if (isDefined(senderWorkspaceMemberId)) {
    const sender = authorLookup.workspaceMembers.find(
      ({ id }) => id === senderWorkspaceMemberId,
    );

    return {
      type: 'member',
      senderWorkspaceMemberId,
      sender,
      name: getAgentChatSenderLabel({
        sender,
        isCurrentWorkspaceMember: false,
      }),
      isNameResolved: isDefined(sender),
    };
  }

  return {
    type: 'unknown',
    messageId: message.id,
    name:
      message.role === AGENT_MESSAGE_ROLE.ASSISTANT
        ? t`Assistant`
        : t`Unknown sender`,
    isNameResolved: true,
  };
};
