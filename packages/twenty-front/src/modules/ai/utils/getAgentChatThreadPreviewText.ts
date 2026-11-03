import {
  AGENT_CHAT_ASSISTANT_NAME,
  type AgentChatThreadRowMetadata,
} from 'twenty-shared/ai';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatPreviewPlainText } from '@/ai/utils/getAgentChatPreviewPlainText';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAgentChatThreadPreviewText = ({
  thread,
  workspaceMembers,
  currentWorkspaceMemberId,
  rowMetadata,
}: {
  thread: Pick<
    AgentChatThreadRecord,
    'lastMessageText' | 'lastMessageSenderWorkspaceMemberId'
  >;
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMemberId: string | undefined;
  rowMetadata?: AgentChatThreadRowMetadata | null;
}): string | null => {
  const previewSource = isDefined(rowMetadata)
    ? rowMetadata.previewText
    : thread.lastMessageText;
  const text = getAgentChatPreviewPlainText(previewSource ?? '');

  if (!isNonEmptyString(text)) {
    return null;
  }

  if (rowMetadata?.senderType === 'assistant') {
    const senderName = isDefined(rowMetadata.senderId)
      ? t`Assistant`
      : AGENT_CHAT_ASSISTANT_NAME;
    return t`${senderName}: ${text}`;
  }

  if (
    rowMetadata?.senderType === 'application' ||
    rowMetadata?.senderType === 'workflow'
  ) {
    const senderName = isNonEmptyString(rowMetadata.senderName)
      ? rowMetadata.senderName
      : rowMetadata.senderType === 'application'
        ? t`Application`
        : t`Workflow`;
    return t`${senderName}: ${text}`;
  }

  const senderId = isDefined(rowMetadata)
    ? rowMetadata.senderType === 'member'
      ? rowMetadata.senderId
      : null
    : thread.lastMessageSenderWorkspaceMemberId;

  if (!isDefined(senderId)) {
    return text;
  }

  const senderLabel = getAgentChatSenderLabel({
    sender: workspaceMembers.find(({ id }) => id === senderId),
    isCurrentWorkspaceMember: senderId === currentWorkspaceMemberId,
  });

  return t`${senderLabel}: ${text}`;
};
