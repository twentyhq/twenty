import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

export const hasSameBillingPlanLabel = (
  planKey: BillingPlanKey,
  otherPlanKey: BillingPlanKey,
) => BILLING_PLAN_LABELS[planKey].id === BILLING_PLAN_LABELS[otherPlanKey].id;
