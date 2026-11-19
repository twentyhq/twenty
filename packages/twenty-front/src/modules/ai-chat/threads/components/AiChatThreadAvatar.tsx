import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, type AvatarSize } from 'twenty-ui/primitives/data-display';

import { AiChatAssistantAvatar } from '@/ai-chat/components/AiChatAssistantAvatar';
import { AiChatThreadIconTile } from '@/ai-chat/threads/components/AiChatThreadIconTile';
import { AI_CHAT_THREAD_ASSISTANT_AVATAR_SIZES } from '@/ai-chat/threads/constants/AiChatThreadAssistantAvatarSizes';
import { isAiChatThreadDirectAssistantChat } from '@/ai-chat/threads/utils/isAiChatThreadDirectAssistantChat';
import { useAiChatThreadMembers } from '@/ai-chat/threads/hooks/useAiChatThreadMembers';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { WorkspaceMemberAvatarStack } from '@/workspace-member/components/WorkspaceMemberAvatarStack';

type AiChatThreadAvatarProps = {
  thread: AiChatThreadRecord;
  size?: AvatarSize;
};

export const AiChatThreadAvatar = ({
  thread,
  size = 'lg',
}: AiChatThreadAvatarProps) => {
  const { t } = useLingui();
  const threadMembers = useAiChatThreadMembers(thread);

  const imageUrl = thread.imageFile?.[0]?.url;

  if (isNonEmptyString(imageUrl)) {
    return (
      <Avatar
        src={imageUrl}
        imageProps={{ alt: '' }}
        size={size}
        shape="circle"
      />
    );
  }

  if (isNonEmptyString(thread.icon)) {
    return (
      <AiChatThreadIconTile
        icon={thread.icon}
        color={thread.iconColor}
        size={size}
      />
    );
  }

  if (isAiChatThreadDirectAssistantChat(thread)) {
    return (
      <AiChatAssistantAvatar
        size={AI_CHAT_THREAD_ASSISTANT_AVATAR_SIZES[size]}
      />
    );
  }

  const [onlyMember, secondMember] = threadMembers;

  if (isDefined(onlyMember) && !isDefined(secondMember)) {
    const name = getWorkspaceMemberNameOrEmail(onlyMember);

    return (
      <Avatar
        src={getAbsoluteImageUrl(onlyMember.avatarUrl)}
        name={name}
        imageProps={{ alt: name }}
        colorSeed={onlyMember.id}
        size={size}
        shape="circle"
      />
    );
  }

  return (
    <WorkspaceMemberAvatarStack
      workspaceMembers={threadMembers}
      defaultAvatarName={t`Member`}
      maxVisible={2}
    />
  );
};
