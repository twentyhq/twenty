import { t } from '@lingui/core/macro';
import type { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { BillingPlanKey, SubscriptionInterval } from '~/generated/graphql';

export const isMonthlyPlan = (
  currentWorkspace: CurrentWorkspace | null | undefined,
): boolean =>
  currentWorkspace?.currentBillingSubscription?.interval ===
  SubscriptionInterval.Month;

export const isYearlyPlan = (
  currentWorkspace: CurrentWorkspace | null | undefined,
): boolean =>
  currentWorkspace?.currentBillingSubscription?.interval ===
  SubscriptionInterval.Year;

export const isProPlan = (
  currentWorkspace: CurrentWorkspace | null | undefined,
): boolean =>
  currentWorkspace?.currentBillingSubscription?.metadata?.['plan'] ===
  BillingPlanKey.PRO;

export const isEnterprisePlan = (
  currentWorkspace: CurrentWorkspace | null | undefined,
): boolean =>
  currentWorkspace?.currentBillingSubscription?.metadata?.['plan'] ===
  BillingPlanKey.ENTERPRISE;

export const getIntervalLabel = (
  isMonthly: boolean,
  asAdjective: boolean = false,
): string =>
  isMonthly && asAdjective
    ? t`monthly`
    : asAdjective
      ? t`yearly`
      : isMonthly
        ? t`month`
        : t`year`;
