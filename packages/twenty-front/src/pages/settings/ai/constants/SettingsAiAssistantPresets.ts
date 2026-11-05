import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';

export const SETTINGS_AI_ASSISTANT_PRESETS = [
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  {
    displayName: doNotTranslate('Scout'),
    avatarShape: 'cookie',
    avatarColor: 'orange',
    avatarFace: 'wink',
    isAvatarAnimated: false,
  },
  {
    displayName: doNotTranslate('Nova'),
    avatarShape: 'cloud',
    avatarColor: 'sky',
    avatarFace: 'happy',
    isAvatarAnimated: false,
  },
  {
    displayName: doNotTranslate('Sage'),
    avatarShape: 'clover',
    avatarColor: 'green',
    avatarFace: 'sleepy',
    isAvatarAnimated: false,
  },
  {
    displayName: doNotTranslate('Pixel'),
    avatarShape: 'hexagon',
    avatarColor: 'purple',
    avatarFace: 'surprised',
    isAvatarAnimated: false,
  },
  {
    displayName: doNotTranslate('Echo'),
    avatarShape: 'pill',
    avatarColor: 'pink',
    avatarFace: 'love',
    isAvatarAnimated: false,
  },
  {
    displayName: doNotTranslate('Atlas'),
    avatarShape: 'gem',
    avatarColor: 'turquoise',
    avatarFace: 'default',
    isAvatarAnimated: false,
  },
] as const satisfies readonly AiChatAssistantProfile[];
