import { msg } from '@lingui/core/macro';
import { IconMail, IconSettingsAutomation, IconSparkles } from 'twenty-ui/icon';

import { type UsageLimitPreset } from '@/settings/billing/types/UsageLimitPreset';
import {
  UsageOperationType,
  UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';

export const USAGE_LIMIT_PRESETS = {
  aiCredits: {
    Icon: IconSparkles,
    title: msg`AI credits`,
    description: msg`Cap what the workspace spends on AI each month.`,
    values: {
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      spenderType: 'workspace',
      unit: UsageUnit.CREDIT,
      periodUnit: 'month',
    },
  },
  workflowCredits: {
    Icon: IconSettingsAutomation,
    title: msg`Workflow credits`,
    description: msg`Cap what your workflows spend each month.`,
    values: {
      resourceType: UsageResourceType.WORKFLOW,
      operationType: UsageOperationType.WORKFLOW_EXECUTION,
      spenderType: 'workspace',
      unit: UsageUnit.CREDIT,
      periodUnit: 'month',
    },
  },
  monthlyEmails: {
    Icon: IconMail,
    title: msg`Emails sent`,
    description: msg`Cap how many emails the workspace sends each month.`,
    values: {
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenderType: 'workspace',
      unit: UsageUnit.INVOCATION,
      periodUnit: 'month',
    },
  },
} as const satisfies Record<string, UsageLimitPreset>;
