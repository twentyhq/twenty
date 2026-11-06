import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type AiChatAssistantProfile } from 'twenty-shared/ai';

export const SETTINGS_AI_ASSISTANT_SHAPE_LABELS = {
  circle: msg`Circle`,
  cookie: msg`Cookie`,
  cloud: msg`Cloud`,
  clover: msg`Clover`,
  flower: msg`Flower`,
  burst: msg`Burst`,
  pill: msg`Pill`,
  arch: msg`Arch`,
  gem: msg`Gem`,
  hexagon: msg`Hexagon`,
} satisfies Record<AiChatAssistantProfile['avatarShape'], MessageDescriptor>;
