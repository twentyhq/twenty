import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type AiChatAssistantProfile } from 'twenty-shared/ai';

export const SETTINGS_AI_ASSISTANT_COLOR_LABELS = {
  blue: msg`Blue`,
  sky: msg`Sky`,
  turquoise: msg`Turquoise`,
  green: msg`Green`,
  yellow: msg`Yellow`,
  orange: msg`Orange`,
  red: msg`Red`,
  pink: msg`Pink`,
  purple: msg`Purple`,
  gray: msg`Gray`,
} satisfies Record<AiChatAssistantProfile['avatarColor'], MessageDescriptor>;
