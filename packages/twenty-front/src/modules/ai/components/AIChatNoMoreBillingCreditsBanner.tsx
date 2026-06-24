import { AiChatBanner } from '@/ai/components/AiChatBanner';
import { useAiChatEndTrialPeriod } from '@/ai/hooks/useAiChatEndTrialPeriod';
import { AddCreditCardModal } from '@/settings/billing/components/AddCreditCardModal';
import { StartSubscriptionConfirmationModal } from '@/settings/billing/components/StartSubscriptionConfirmationModal';
import { useCreditUpgradeAction } from '@/settings/billing/hooks/useCreditUpgradeAction';
import { useIsEmbeddedCardPaymentAvailable } from '@/settings/billing/hooks/useIsEmbeddedCardPaymentAvailable';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

const AI_CHAT_END_TRIAL_PERIOD_MODAL_ID = 'ai-chat-end-trial-period-modal';
const AI_CHAT_UPGRADE_CREDIT_PLAN_MODAL_ID =
  'ai-chat-upgrade-credit-plan-modal';

export const AIChatNoMoreBillingCreditsBanner = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();

  const { openModal } = useModal();

  const { [PermissionFlagType.BILLING]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const {
    endTrialPeriodFromAiChat,
    startSubscriptionAfterPaymentMethodFromAiChat,
    finalRedirectPath,
    isEndTrialLoading,
    hasPaymentMethod,
  } = useAiChatEndTrialPeriod();

  const isEmbeddedCardPaymentAvailable = useIsEmbeddedCardPaymentAvailable();

  const {
    nextPrice,
    nextResourceCreditsAmount,
    nextResourceCreditPrice,
    nextTierInterval,
    upgradeCreditPlan,
    isUpgrading,
  } = useCreditUpgradeAction();

  if (!hasPermissionToManageBilling) {
    return null;
  }

  const message = isTrialing
    ? t`You've hit your usage limit. Subscribe for more usage.`
    : isDefined(nextPrice)
      ? t`You've hit your usage limit. \nUpgrade to ${nextResourceCreditsAmount ?? ''} credits for $${nextResourceCreditPrice ?? ''}/${nextTierInterval ?? ''}.`
      : t`You've hit your usage limit. \nReach to our support team to upgrade.`;

  const buttonTitle = isTrialing
    ? hasPaymentMethod === false
      ? t`Add Credit Card`
      : t`Subscribe Now`
    : isDefined(nextPrice)
      ? t`Upgrade`
      : undefined;

  const handleButtonClick = isTrialing
    ? () => openModal(AI_CHAT_END_TRIAL_PERIOD_MODAL_ID)
    : isDefined(nextPrice)
      ? () => openModal(AI_CHAT_UPGRADE_CREDIT_PLAN_MODAL_ID)
      : undefined;

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
      {isTrialing &&
        (hasPaymentMethod === false && isEmbeddedCardPaymentAvailable ? (
          <AddCreditCardModal
            modalInstanceId={AI_CHAT_END_TRIAL_PERIOD_MODAL_ID}
            finalRedirectPath={finalRedirectPath}
            onPaymentMethodAdded={startSubscriptionAfterPaymentMethodFromAiChat}
          />
        ) : (
          <StartSubscriptionConfirmationModal
            modalInstanceId={AI_CHAT_END_TRIAL_PERIOD_MODAL_ID}
            hasPaymentMethod={hasPaymentMethod}
            onConfirmClick={endTrialPeriodFromAiChat}
            loading={isEndTrialLoading}
          />
        ))}
      {!isTrialing && (
        <ConfirmationModal
          modalInstanceId={AI_CHAT_UPGRADE_CREDIT_PLAN_MODAL_ID}
          title={t`Get more credits`}
          subtitle={t`Upgrade to ${nextResourceCreditsAmount ?? ''} credits for $${nextResourceCreditPrice ?? ''}/${nextTierInterval ?? ''}.`}
          onConfirmClick={upgradeCreditPlan}
          confirmButtonText={t`Upgrade`}
          confirmButtonAccent="blue"
          loading={isUpgrading}
        />
      )}
    </>
  );
};
