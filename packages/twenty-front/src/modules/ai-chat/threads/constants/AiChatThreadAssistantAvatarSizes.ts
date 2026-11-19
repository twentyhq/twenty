import { type AssistantAvatarProps } from 'twenty-ui/components/data-display';
import { type AvatarSize } from 'twenty-ui/primitives/data-display';

export const AI_CHAT_THREAD_ASSISTANT_AVATAR_SIZES: Record<
  AvatarSize,
  NonNullable<AssistantAvatarProps['size']>
> = {
  xxl: 40,
  xl: 24,
  lg: 24,
  md: 16,
  sm: 14,
  xs: 14,
};
