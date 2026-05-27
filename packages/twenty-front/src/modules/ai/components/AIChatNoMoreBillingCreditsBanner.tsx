import { AiChatBanner } from '@/ai/components/AiChatBanner';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useGetNextResourceCreditPrice } from '@/settings/billing/hooks/useGetNextResourceCreditPrice';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  PermissionFlagType,
  SetResourceCreditSubscriptionPriceDocument,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

const AI_CHAT_END_TRIAL_PERIOD_MODAL_ID = 'ai-chat-end-trial-period-modal';
const AI_CHAT_UPGRADE_CREDIT_PLAN_MODAL_ID =
  'ai-chat-upgrade-credit-plan-modal';

export const AIChatNoMoreBillingCreditsBanner = () => {
  const subscriptionStatus = useSubscriptionStatus();

  const { openModal } = useModal();
  const { endTrialPeriod, isLoading: isEndTrialLoading } =
    useEndSubscriptionTrialPeriod();

  const nextPrice = useGetNextResourceCreditPrice();

  const { formatNumber } = useNumberFormat();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [setResourceCreditSubscriptionPrice, { loading: isUpgrading }] =
    useMutation(SetResourceCreditSubscriptionPriceDocument);

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  if (!hasPermissionToManageBilling) {
    return null;
  }

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const nextResourceCreditsAmount = isDefined(nextPrice)
    ? formatNumber(nextPrice.creditAmount ?? 0, {
        abbreviate: true,
        decimals: 2,
      })
    : null;

  const nextResourceCreditPrice = isDefined(nextPrice)
    ? formatNumber((nextPrice.unitAmount ?? 0) / 100)
    : null;

  const nextTierInterval = isDefined(nextPrice)
    ? nextPrice.recurringInterval === SubscriptionInterval.Month
      ? t`month`
      : t`year`
    : null;

  const message = isTrialing
    ? t`You've hit your usage limit. Subscribe for more usage.`
    : isDefined(nextPrice)
      ? t`You've hit your usage limit. \nUpgrade to ${nextResourceCreditsAmount} credits for $${nextResourceCreditPrice}/${nextTierInterval}.`
      : t`You've hit your usage limit. \nReach to our support team to upgrade.`;

  const buttonTitle = isTrialing
    ? t`Subscribe Now`
    : isDefined(nextPrice)
      ? t`Upgrade`
      : undefined;

  const handleButtonClick = isTrialing
    ? () => openModal(AI_CHAT_END_TRIAL_PERIOD_MODAL_ID)
    : isDefined(nextPrice)
      ? () => openModal(AI_CHAT_UPGRADE_CREDIT_PLAN_MODAL_ID)
      : undefined;

  const handleUpgradeConfirm = async () => {
    if (!isDefined(nextPrice)) return;
    try {
      const { data } = await setResourceCreditSubscriptionPrice({
        variables: { priceId: nextPrice.stripePriceId },
      });
      if (
        isDefined(
          data?.setResourceCreditSubscriptionPrice.currentBillingSubscription,
        ) &&
        isDefined(currentWorkspace)
      ) {
        setCurrentWorkspace({
          ...currentWorkspace,
          currentBillingSubscription:
            data.setResourceCreditSubscriptionPrice.currentBillingSubscription,
          billingSubscriptions:
            data.setResourceCreditSubscriptionPrice.billingSubscriptions,
        });
      }
      enqueueSuccessSnackBar({ message: t`Credit plan upgraded.` });
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to upgrade credit plan.` });
    }
  };

  return (
    <>
      <AiChatBanner
        message={message}
        variant="warning"
        buttonTitle={buttonTitle}
        buttonOnClick={handleButtonClick}
        isButtonLoading={
          (isTrialing && isEndTrialLoading) || (!isTrialing && isUpgrading)
        }
      />
      {isTrialing && (
        <ConfirmationModal
          modalInstanceId={AI_CHAT_END_TRIAL_PERIOD_MODAL_ID}
          title={t`Start Your Subscription`}
          subtitle={t`We will activate your paid plan. Do you want to proceed?`}
          onConfirmClick={endTrialPeriod}
          confirmButtonText={t`Confirm`}
          confirmButtonAccent="blue"
          loading={isEndTrialLoading}
        />
      )}
      {!isTrialing && (
        <ConfirmationModal
          modalInstanceId={AI_CHAT_UPGRADE_CREDIT_PLAN_MODAL_ID}
          title={t`Get more credits`}
          subtitle={t`Upgrade to ${nextResourceCreditsAmount} credits for $${nextResourceCreditPrice}/${nextTierInterval}.`}
          onConfirmClick={handleUpgradeConfirm}
          confirmButtonText={t`Upgrade`}
          confirmButtonAccent="blue"
          loading={isUpgrading}
        />
      )}
    </>
  );
};
