import { msg } from '@lingui/core/macro';

import { type UsageLimitUnitLabel } from '@/settings/billing/types/UsageLimitUnitLabel';
import { UsageOperationType } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_INVOCATION_LABELS: Partial<
  Record<UsageOperationType, UsageLimitUnitLabel>
> = {
  [UsageOperationType.WORKFLOW_EXECUTION]: {
    name: msg`Steps`,
    suffix: msg`steps`,
  },
  [UsageOperationType.CODE_EXECUTION]: { name: msg`Runs`, suffix: msg`runs` },
  [UsageOperationType.WEB_SEARCH]: {
    name: msg`Searches`,
    suffix: msg`searches`,
  },
  [UsageOperationType.EMAIL_SEND]: { name: msg`Emails`, suffix: msg`emails` },
  [UsageOperationType.MESSAGE_CAMPAIGN_SEND]: {
    name: msg`Emails`,
    suffix: msg`emails`,
  },
};
