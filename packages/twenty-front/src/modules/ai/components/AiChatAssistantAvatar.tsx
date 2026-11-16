import {
  AssistantAvatar,
  type AssistantAvatarProps,
} from 'twenty-ui/components/data-display';

import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';

type AiChatAssistantAvatarProps = Pick<AssistantAvatarProps, 'size'>;

export const AiChatAssistantAvatar = ({
  size = 16,
}: AiChatAssistantAvatarProps) => {
  const { avatarShape, avatarColor, avatarFace, isAvatarAnimated } =
    useAiChatAssistantProfile();

  return (
    <AssistantAvatar
      shape={avatarShape}
      color={avatarColor}
      face={avatarFace}
      isAnimated={isAvatarAnimated}
      size={size}
    />
  );
};
