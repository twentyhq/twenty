import { AiChatBanner } from '@/ai/components/AiChatBanner';
import { useAiChatEndTrialPeriod } from '@/ai/hooks/useAiChatEndTrialPeriod';
import { StartSubscriptionConfirmationModal } from '@/settings/billing/components/StartSubscriptionConfirmationModal';
import { useCreditUpgradeAction } from '@/settings/billing/hooks/useCreditUpgradeAction';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { hasReachedCurrentBillingPeriodCapSelector } from '@/workspace/states/hasReachedCurrentBillingPeriodCapSelector';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconSparkles } from 'twenty-ui-deprecated/display';
import {
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const AI_CHAT_EXHAUSTED_END_TRIAL_PERIOD_MODAL_ID =
  'ai-chat-exhausted-end-trial-period-modal';
const AI_CHAT_EXHAUSTED_UPGRADE_CREDIT_PLAN_MODAL_ID =
  'ai-chat-exhausted-upgrade-credit-plan-modal';

export const AiChatCreditsExhaustedMessage = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const navigateSettings = useNavigateSettings();
  const { openModal } = useModal();

  const hasReachedCurrentBillingPeriodCap = useAtomStateValue(
    hasReachedCurrentBillingPeriodCapSelector,
  );

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const { endTrialPeriodFromAiChat, isEndTrialLoading, hasPaymentMethod } =
    useAiChatEndTrialPeriod();

  const {
    nextPrice,
    nextResourceCreditsAmount,
    nextResourceCreditPrice,
    nextTierInterval,
    upgradeCreditPlan,
    isUpgrading,
  } = useCreditUpgradeAction();



  if (!hasPermissionToManageBilling) {
    return (
      <AiChatBanner
        message={t`Credits exhausted. Please contact your workspace admin to upgrade.`}
        variant="warning"
        buttonIcon={IconSparkles}
      />
    );
  }

  const message = isTrialing
    ? t`Free trial credits exhausted. Subscribe now to continue using AI features.`
    : isDefined(nextPrice)
      ? t`Credits exhausted. Upgrade to ${nextResourceCreditsAmount ?? ''} credits for $${nextResourceCreditPrice ?? ''}/${nextTierInterval ?? ''}.`
      : t`Credits exhausted. Reach to our support team to upgrade.`;

  const buttonTitle = isTrialing
    ? hasPaymentMethod === false
      ? t`Add Credit Card`
      : t`Subscribe Now`
    : isDefined(nextPrice)
      ? t`Upgrade Plan`
      : undefined;

  const handleButtonClick = isTrialing
    ? () => openModal(AI_CHAT_EXHAUSTED_END_TRIAL_PERIOD_MODAL_ID)
    : isDefined(nextPrice)
      ? () => openModal(AI_CHAT_EXHAUSTED_UPGRADE_CREDIT_PLAN_MODAL_ID)
      : () => navigateSettings(SettingsPath.Billing);

  return (
    <>
      <AiChatBanner
        message={message}
        variant="warning"
        buttonTitle={buttonTitle}
        buttonIcon={IconSparkles}
        buttonOnClick={handleButtonClick}
        isButtonLoading={
          (isTrialing && isEndTrialLoading) || (!isTrialing && isUpgrading)
        }
      />
      {isTrialing && (
        <StartSubscriptionConfirmationModal
          modalInstanceId={AI_CHAT_EXHAUSTED_END_TRIAL_PERIOD_MODAL_ID}
          hasPaymentMethod={hasPaymentMethod}
          onConfirmClick={endTrialPeriodFromAiChat}
          loading={isEndTrialLoading}
        />
      )}
      {!isTrialing && isDefined(nextPrice) && (
        <ConfirmationModal
          modalInstanceId={AI_CHAT_EXHAUSTED_UPGRADE_CREDIT_PLAN_MODAL_ID}
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
