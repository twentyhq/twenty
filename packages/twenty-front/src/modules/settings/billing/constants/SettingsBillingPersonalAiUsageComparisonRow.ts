import { msg } from '@lingui/core/macro';

import { type SettingsBillingPlanComparisonFeatureRow } from '@/settings/billing/types/SettingsBillingPlanComparison';
import { BillingPlanKey } from '~/generated-metadata/graphql';

export const SETTINGS_BILLING_PERSONAL_AI_USAGE_COMPARISON_ROW: SettingsBillingPlanComparisonFeatureRow =
  {
    featureLabel: msg`Personal AI usage`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'excluded' },
      [BillingPlanKey.ORGANIZATION_V2]: {
        detail: msg`per member`,
        kind: 'text',
        text: msg`≈ 500 AI tasks/week`,
      },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
      [BillingPlanKey.PRO_V2]: {
        detail: msg`per member`,
        kind: 'text',
        text: msg`≈ 100 AI tasks/week`,
      },
    },
    type: 'feature',
  };
