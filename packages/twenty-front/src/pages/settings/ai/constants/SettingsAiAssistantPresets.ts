import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';

export const SETTINGS_AI_ASSISTANT_PRESETS = [
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  {
    displayName: 'Scout',
    avatarShape: 'cookie',
    avatarColor: 'orange',
    avatarFace: 'wink',
    isAvatarAnimated: false,
  },
  {
    displayName: 'Nova',
    avatarShape: 'cloud',
    avatarColor: 'sky',
    avatarFace: 'happy',
    isAvatarAnimated: false,
  },
  {
    displayName: 'Sage',
    avatarShape: 'clover',
    avatarColor: 'green',
    avatarFace: 'sleepy',
    isAvatarAnimated: false,
  },
  {
    displayName: 'Pixel',
    avatarShape: 'hexagon',
    avatarColor: 'purple',
    avatarFace: 'surprised',
    isAvatarAnimated: false,
  },
  {
    displayName: 'Echo',
    avatarShape: 'pill',
    avatarColor: 'pink',
    avatarFace: 'love',
    isAvatarAnimated: false,
  },
  {
    displayName: 'Atlas',
    avatarShape: 'gem',
    avatarColor: 'turquoise',
    avatarFace: 'default',
    isAvatarAnimated: false,
  },
] as const satisfies readonly AiChatAssistantProfile[];
