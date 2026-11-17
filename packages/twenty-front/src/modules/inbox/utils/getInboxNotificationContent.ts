import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadDisplayIdentity } from '@/ai/types/AiChatThreadDisplayIdentity';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getAiChatPreviewPlainText } from '@/ai/utils/getAiChatPreviewPlainText';
import { getAiChatSenderLabel } from '@/ai/utils/getAiChatSenderLabel';
import { getAiChatThreadDisplayLabel } from '@/ai/utils/getAiChatThreadDisplayLabel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const getInboxNotificationContent = ({
  thread,
  workspaceMembers,
  currentWorkspaceMemberId,
  assistantDisplayName,
  isPreviewEnabled,
}: {
  thread: AiChatThreadDisplayIdentity &
    Pick<
      AiChatThreadRecord,
      | 'id'
      | 'lastActivityAt'
      | 'lastMessageText'
      | 'lastMessageSenderWorkspaceMemberId'
    >;
  workspaceMembers: Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail' | 'avatarUrl'
  >[];
  currentWorkspaceMemberId: string | undefined;
  assistantDisplayName: string;
  isPreviewEnabled: boolean;
}): { title: string; options: NotificationOptions } => {
  const senderWorkspaceMemberId = thread.lastMessageSenderWorkspaceMemberId;
  const sender = workspaceMembers.find(
    ({ id }) => id === senderWorkspaceMemberId,
  );
  const senderName = getAiChatSenderLabel({
    sender,
    isCurrentWorkspaceMember: false,
  });
  const threadLabel = getAiChatThreadDisplayLabel({
    thread,
    currentWorkspaceMemberId,
    workspaceMembers,
    fallbackLabel: t`New chat`,
    formerMemberLabel: t`Former member`,
  });
  const isSenderInTitle =
    isDefined(senderWorkspaceMemberId) &&
    thread.conversationType !== AgentChatThreadConversationType.DIRECT_MESSAGE;
  const previewText = isPreviewEnabled
    ? getAiChatPreviewPlainText({
        markdown: thread.lastMessageText ?? '',
        assistantDisplayName,
      })
    : '';

  return {
    title: isSenderInTitle ? t`${senderName} in ${threadLabel}` : threadLabel,
    options: {
      body: isNonEmptyString(previewText) ? previewText : t`New message`,
      icon:
        getAbsoluteImageUrl(sender?.avatarUrl) ??
        '/images/icons/android/android-launchericon-192-192.png',
      tag: `inbox-${thread.id}-${thread.lastActivityAt}`,
    },
  };
};
