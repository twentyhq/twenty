import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';
import { isBillingSubscriptionChangeImmediate } from '@/settings/billing/utils/isBillingSubscriptionChangeImmediate';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { assertUnreachable } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import {
  CancelSwitchBillingIntervalDocument,
  CancelSwitchBillingPlanDocument,
  SubscriptionInterval,
  SwitchBillingPlanDocument,
  SwitchSubscriptionIntervalDocument,
} from '~/generated-metadata/graphql';

export const useApplyBillingSubscriptionChange = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const { enqueueToast } = useToast();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();
  const { getBeautifiedRenewDate, getBillingPlanLabel } = useBillingWording();

  const [switchBillingPlanMutation] = useMutation(SwitchBillingPlanDocument);
  const [switchSubscriptionIntervalMutation] = useMutation(
    SwitchSubscriptionIntervalDocument,
  );
  const [cancelSwitchBillingPlanMutation] = useMutation(
    CancelSwitchBillingPlanDocument,
  );
  const [cancelSwitchBillingIntervalMutation] = useMutation(
    CancelSwitchBillingIntervalDocument,
  );

  const [
    isApplyingBillingSubscriptionChange,
    setIsApplyingBillingSubscriptionChange,
  ] = useState(false);

  const runBillingSubscriptionChangeMutation = async (
    change: BillingSubscriptionChange,
  ) => {
    switch (change.type) {
      case 'SWITCH_PLAN': {
        const { data } = await switchBillingPlanMutation();

        return data?.switchBillingPlan;
      }
      case 'SWITCH_INTERVAL': {
        const { data } = await switchSubscriptionIntervalMutation();

        return data?.switchSubscriptionInterval;
      }
      case 'CANCEL_PLAN_SWITCH': {
        const { data } = await cancelSwitchBillingPlanMutation();

        return data?.cancelSwitchBillingPlan;
      }
      case 'CANCEL_INTERVAL_SWITCH': {
        const { data } = await cancelSwitchBillingIntervalMutation();

        return data?.cancelSwitchBillingInterval;
      }
      default:
        return assertUnreachable(change);
    }
  };

  const getSuccessMessage = (change: BillingSubscriptionChange) => {
    const isImmediate = isBillingSubscriptionChangeImmediate({
      change,
      subscriptionStatus,
    });

    switch (change.type) {
      case 'SWITCH_PLAN': {
        const planLabel = getBillingPlanLabel(change.targetPlanKey);

        return isImmediate
          ? t`Subscription has been switched to ${planLabel} Plan.`
          : t`Subscription will be switched to ${planLabel} Plan the ${getBeautifiedRenewDate()}.`;
      }
      case 'SWITCH_INTERVAL': {
        if (change.targetInterval === SubscriptionInterval.Year) {
          return t`Subscription has been switched to annual billing.`;
        }

        return isImmediate
          ? t`Subscription has been switched to monthly billing.`
          : t`Subscription will be switched to monthly billing the ${getBeautifiedRenewDate()}.`;
      }
      case 'CANCEL_PLAN_SWITCH':
        return t`Plan switching has been cancelled.`;
      case 'CANCEL_INTERVAL_SWITCH':
        return t`Interval switching has been cancelled.`;
      default:
        return assertUnreachable(change);
    }
  };

  const getErrorMessage = (change: BillingSubscriptionChange) => {
    switch (change.type) {
      case 'CANCEL_PLAN_SWITCH':
        return t`Error while cancelling plan switching.`;
      case 'CANCEL_INTERVAL_SWITCH':
        return t`Error while cancelling interval switching.`;
      case 'SWITCH_PLAN':
      case 'SWITCH_INTERVAL':
        return t`Error while switching subscription.`;
      default:
        return assertUnreachable(change);
    }
  };

  const applyBillingSubscriptionChange = async (
    change: BillingSubscriptionChange,
  ) => {
    if (isApplyingBillingSubscriptionChange) {
      return;
    }

    setIsApplyingBillingSubscriptionChange(true);

    try {
      const billingUpdate = await runBillingSubscriptionChangeMutation(change);
      const isBillingUpdateApplied = applyCurrentWorkspaceBillingUpdate(
        billingUpdate,
        { onBillingUpdateApplied: refetchResourceCreditUsage },
      );

      if (!isBillingUpdateApplied) {
        enqueueToast({ variant: 'error', children: getErrorMessage(change) });
        return;
      }

      enqueueToast({ variant: 'success', children: getSuccessMessage(change) });
    } catch (error) {
      enqueueToast({ variant: 'error', children: getErrorMessage(change) });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    } finally {
      setIsApplyingBillingSubscriptionChange(false);
    }
  };

  return {
    applyBillingSubscriptionChange,
    isApplyingBillingSubscriptionChange,
  };
};
