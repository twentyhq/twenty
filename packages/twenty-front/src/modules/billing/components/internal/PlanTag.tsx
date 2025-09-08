import React from 'react';
import { Tag } from 'twenty-ui/components';
import { t } from '@lingui/core/macro';
import { BillingPlanKey } from '~/generated-metadata/graphql';

export type PlanTagProps = {
  plan: BillingPlanKey;
  isTrialPeriod?: boolean;
};

export const PlanTag = ({ plan, isTrialPeriod = false }: PlanTagProps) => {
  const planDescriptor =
    plan === BillingPlanKey.PRO
      ? { color: 'sky' as const, label: t`Pro` }
      : { color: 'purple' as const, label: t`Organization` };

  return (
    <div>
      <Tag color={planDescriptor.color} text={planDescriptor.label} />
      {isTrialPeriod && <Tag color="blue" text={t`Trial`} preventShrink />}
    </div>
  );
};
