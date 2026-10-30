import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import { type AgentAvatarShape } from 'twenty-shared/ai';

export const CORE_AGENT_AVATAR_SHAPE_LABELS: Record<
  AgentAvatarShape,
  MessageDescriptor
> = {
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
};
