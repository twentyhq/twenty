import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type AiChatAssistantProfile } from 'twenty-shared/ai';

export const SETTINGS_AI_ASSISTANT_FACE_LABELS = {
  default: msg`Default`,
  happy: msg`Happy`,
  wink: msg`Wink`,
  surprised: msg`Surprised`,
  sleepy: msg`Sleepy`,
  love: msg`Love`,
} satisfies Record<AiChatAssistantProfile['avatarFace'], MessageDescriptor>;
