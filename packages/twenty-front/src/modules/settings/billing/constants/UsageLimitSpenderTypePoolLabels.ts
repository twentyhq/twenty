import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';

export const USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS: Record<
  UsageLimitSpenderType,
  MessageDescriptor
> = {
  workspace: msg`The whole workspace`,
  userWorkspace: msg`All users`,
  apiKey: msg`All API keys`,
  application: msg`All applications`,
  agent: msg`All agents`,
  workflow: msg`All workflows`,
  logicFunction: msg`All logic functions`,
};
