import { useLingui } from '@lingui/react/macro';
import {
  IconArrowDown,
  IconArrowUp,
  IconCircleX,
  IconCreditCard,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

export type SettingsBillingSubscriptionInfoCardHeaderActionsProps = {
  canCancelIntervalSwitch: boolean;
  canCancelPlanSwitch: boolean;
  canStartSubscription: boolean;
  canSwitchToOrganizationPlan: boolean;
  canSwitchToProPlan: boolean;
  isCancellationScheduled: boolean;
  isEndTrialPeriodDisabled: boolean;
  isSubscriptionActionDisabled: boolean;
  isTrialPeriod: boolean;
  isUpdatePaymentDisabled: boolean;
  onCancelIntervalSwitch: () => void;
  onCancelPlanSwitch: () => void;
  onEndTrialPeriod: () => void;
  onSwitchToOrganization: () => void;
  onSwitchToPro: () => void;
  onUpdatePayment: () => void;
  shouldUpdatePayment: boolean;
};

export const SettingsBillingSubscriptionInfoCardHeaderActions = ({
  canCancelIntervalSwitch,
  canCancelPlanSwitch,
  canStartSubscription,
  canSwitchToOrganizationPlan,
  canSwitchToProPlan,
  isCancellationScheduled,
  isEndTrialPeriodDisabled,
  isSubscriptionActionDisabled,
  isTrialPeriod,
  isUpdatePaymentDisabled,
  onCancelIntervalSwitch,
  onCancelPlanSwitch,
  onEndTrialPeriod,
  onSwitchToOrganization,
  onSwitchToPro,
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
      {canSwitchToOrganizationPlan && (
        <Button
          Icon={IconArrowUp}
          title={
            isTrialPeriod
              ? t`Switch to Organization`
              : t`Upgrade to Organization`
          }
          variant={isTrialPeriod ? 'secondary' : 'primary'}
          accent={isTrialPeriod ? 'default' : 'blue'}
          size="small"
          onClick={onSwitchToOrganization}
          disabled={isSubscriptionActionDisabled}
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
      {canSwitchToProPlan && (
        <Button
          Icon={IconArrowDown}
          title={t`Switch to Pro`}
          variant="secondary"
          size="small"
          onClick={onSwitchToPro}
          disabled={isSubscriptionActionDisabled}
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
