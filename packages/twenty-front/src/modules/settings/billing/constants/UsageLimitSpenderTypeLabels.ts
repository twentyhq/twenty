import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';

export const USAGE_LIMIT_SPENDER_TYPE_LABELS: Record<
  UsageLimitSpenderType,
  MessageDescriptor
> = {
  workspace: msg`Workspace`,
  userWorkspace: msg`User`,
  apiKey: msg`API key`,
  application: msg`Application`,
  agent: msg`Agent`,
  workflow: msg`Workflow`,
  logicFunction: msg`Logic function`,
};
