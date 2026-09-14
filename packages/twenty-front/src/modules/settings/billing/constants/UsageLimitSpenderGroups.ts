import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconApps,
  type IconComponent,
  IconKey,
  IconSettings,
  IconUsers,
} from 'twenty-ui/icon';

import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';

export type UsageLimitSpenderGroup = {
  id: string;
  label: MessageDescriptor;
  Icon: IconComponent;
  spenderType: UsageLimitSpenderType;
};

export const USAGE_LIMIT_SPENDER_GROUPS: UsageLimitSpenderGroup[] = [
  {
    id: 'workspace',
    label: msg`Workspace`,
    Icon: IconSettings,
    spenderType: 'workspace',
  },
  {
    id: 'user',
    label: msg`User`,
    Icon: IconUsers,
    spenderType: 'userWorkspace',
  },
  {
    id: 'application',
    label: msg`Application`,
    Icon: IconApps,
    spenderType: 'application',
  },
  {
    id: 'apiKey',
    label: msg`API key`,
    Icon: IconKey,
    spenderType: 'apiKey',
  },
];
