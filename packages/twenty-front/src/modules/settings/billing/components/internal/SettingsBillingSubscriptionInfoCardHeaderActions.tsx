import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconArrowUp,
  IconCircleX,
  IconColorSwatch,
  IconCreditCard,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

export type SettingsBillingSubscriptionInfoCardHeaderActionsProps = {
  canCancelIntervalSwitch: boolean;
  canCancelPlanSwitch: boolean;
  canComparePlans: boolean;
  canStartSubscription: boolean;
  isComparePlansActionPrimary: boolean;
  isCancellationScheduled: boolean;
  isEndTrialPeriodDisabled: boolean;
  isSubscriptionActionDisabled: boolean;
  isManageBillingDisabled: boolean;
  isUpdatePaymentDisabled: boolean;
  onCancelIntervalSwitch: () => void;
  onCancelPlanSwitch: () => void;
  onEndTrialPeriod: () => void;
  onManageBilling: () => void;
  onUpdatePayment: () => void;
  shouldUpdatePayment: boolean;
};

export const SettingsBillingSubscriptionInfoCardHeaderActions = ({
  canCancelIntervalSwitch,
  canCancelPlanSwitch,
  canComparePlans,
  canStartSubscription,
  isComparePlansActionPrimary,
  isCancellationScheduled,
  isEndTrialPeriodDisabled,
  isSubscriptionActionDisabled,
  isManageBillingDisabled,
  isUpdatePaymentDisabled,
  onCancelIntervalSwitch,
  onCancelPlanSwitch,
  onEndTrialPeriod,
  onManageBilling,
  onUpdatePayment,
  shouldUpdatePayment,
}: SettingsBillingSubscriptionInfoCardHeaderActionsProps) => {
  const { t } = useLingui();

  if (isCancellationScheduled) {
    return (
      <Button
        startIcon={<IconCreditCard />}
        size="sm"
        onClick={onManageBilling}
        disabled={isManageBillingDisabled}
        variant="solid"
        color="accent"
      >{t`Manage billing`}</Button>
    );
  }

  if (shouldUpdatePayment) {
    return (
      <Button
        startIcon={<IconArrowUp />}
        size="sm"
        onClick={onUpdatePayment}
        disabled={isUpdatePaymentDisabled}
        variant="solid"
        color="accent"
      >{t`Update payment`}</Button>
    );
  }

  return (
    <>
      {canCancelIntervalSwitch && (
        <Button
          startIcon={<IconCircleX />}
          size="sm"
          onClick={onCancelIntervalSwitch}
          disabled={isSubscriptionActionDisabled}
          variant="outline"
        >{t`Cancel interval switching`}</Button>
      )}
      {canComparePlans && (
        <NavigationButton
          startIcon={<IconColorSwatch />}
          size="sm"
          to={getSettingsPath(SettingsPath.BillingPlans)}
          variant={isComparePlansActionPrimary ? 'solid' : 'outline'}
          color={isComparePlansActionPrimary ? 'accent' : 'neutral'}
        >{t`Compare plans`}</NavigationButton>
      )}
      {canStartSubscription && (
        <Button
          startIcon={<IconArrowUp />}
          size="sm"
          onClick={onEndTrialPeriod}
          disabled={isEndTrialPeriodDisabled}
          variant="solid"
          color="accent"
        >{t`Subscribe Now`}</Button>
      )}
      {canCancelPlanSwitch && (
        <Button
          startIcon={<IconCircleX />}
          size="sm"
          onClick={onCancelPlanSwitch}
          disabled={isSubscriptionActionDisabled}
          variant="outline"
        >{t`Cancel plan switching`}</Button>
      )}
    </>
  );
};
