import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconArrowUp,
  IconCircleX,
  IconColorSwatch,
  IconCreditCard,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

export type SettingsBillingSubscriptionInfoCardHeaderActionsProps = {
  canCancelIntervalSwitch: boolean;
  canCancelPlanSwitch: boolean;
  canComparePlans: boolean;
  canStartSubscription: boolean;
  isComparePlansActionPrimary: boolean;
  isCancellationScheduled: boolean;
  isEndTrialPeriodDisabled: boolean;
  isSubscriptionActionDisabled: boolean;
  isUpdatePaymentDisabled: boolean;
  onCancelIntervalSwitch: () => void;
  onCancelPlanSwitch: () => void;
  onEndTrialPeriod: () => void;
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
  isUpdatePaymentDisabled,
  onCancelIntervalSwitch,
  onCancelPlanSwitch,
  onEndTrialPeriod,
  onUpdatePayment,
  shouldUpdatePayment,
}: SettingsBillingSubscriptionInfoCardHeaderActionsProps) => {
  const { t } = useLingui();

  if (isCancellationScheduled) {
    return (
      <Button
        Icon={IconCreditCard}
        title={t`Manage billing`}
        variant="primary"
        accent="blue"
        size="small"
        onClick={onUpdatePayment}
        disabled={isUpdatePaymentDisabled}
      />
    );
  }

  if (shouldUpdatePayment) {
    return (
      <Button
        Icon={IconArrowUp}
        title={t`Update payment`}
        variant="primary"
        accent="blue"
        size="small"
        onClick={onUpdatePayment}
        disabled={isUpdatePaymentDisabled}
      />
    );
  }

  return (
    <>
      {canCancelIntervalSwitch && (
        <Button
          Icon={IconCircleX}
          title={t`Cancel interval switching`}
          variant="secondary"
          size="small"
          onClick={onCancelIntervalSwitch}
          disabled={isSubscriptionActionDisabled}
        />
      )}
      {canComparePlans && (
        <Button
          Icon={IconColorSwatch}
          title={t`Compare plans`}
          variant={isComparePlansActionPrimary ? 'primary' : 'secondary'}
          accent={isComparePlansActionPrimary ? 'blue' : 'default'}
          size="small"
          to={getSettingsPath(SettingsPath.BillingPlans)}
        />
      )}
      {canStartSubscription && (
        <Button
          Icon={IconArrowUp}
          title={t`Subscribe Now`}
          variant="primary"
          accent="blue"
          size="small"
          onClick={onEndTrialPeriod}
          disabled={isEndTrialPeriodDisabled}
        />
      )}
      {canCancelPlanSwitch && (
        <Button
          Icon={IconCircleX}
          title={t`Cancel plan switching`}
          variant="secondary"
          size="small"
          onClick={onCancelPlanSwitch}
          disabled={isSubscriptionActionDisabled}
        />
      )}
    </>
  );
};
