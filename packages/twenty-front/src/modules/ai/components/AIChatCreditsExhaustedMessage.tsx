import { AIChatBanner } from '@/ai/components/AIChatBanner';
import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconSparkles } from 'twenty-ui/display';
import {
  PermissionFlagType,
  SubscriptionStatus,
  useBillingPortalSessionQuery,
} from '~/generated-metadata/graphql';

export const AIChatCreditsExhaustedMessage = () => {
  const { redirect } = useRedirect();
  const subscriptionStatus = useSubscriptionStatus();
  const { endTrialPeriod, isLoading: isEndingTrial } =
    useEndSubscriptionTrialPeriod();
  const [isProcessing, setIsProcessing] = useState(false);

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  const { data: billingPortalData, loading: isBillingPortalLoading } =
    useBillingPortalSessionQuery({
      variables: {
        returnUrlPath: getSettingsPath(SettingsPath.Billing),
      },
    });

  const openBillingPortal = () => {
    if (
      isDefined(billingPortalData) &&
      isDefined(billingPortalData.billingPortalSession.url)
    ) {
      redirect(billingPortalData.billingPortalSession.url);
    }
  };

  const handleUpgradeClick = async () => {
    if (!isTrialing) {
      openBillingPortal();
      return;
    }

    setIsProcessing(true);
    const result = await endTrialPeriod();
    setIsProcessing(false);

    if (!result.success) {
      openBillingPortal();
    }
  };

  const isLoading = isEndingTrial || isBillingPortalLoading || isProcessing;

  const message = hasPermissionToManageBilling
    ? isTrialing
      ? t`Free trial credits exhausted. Subscribe now to continue using AI features.`
      : t`Credits exhausted. Upgrade your plan to get more credits.`
    : t`Credits exhausted. Please contact your workspace admin to upgrade.`;

  const buttonTitle = isTrialing ? t`Subscribe Now` : t`Upgrade Plan`;

  return (
    <AIChatBanner
      message={message}
      variant="warning"
      buttonTitle={hasPermissionToManageBilling ? buttonTitle : undefined}
      buttonIcon={IconSparkles}
      buttonOnClick={
        hasPermissionToManageBilling ? handleUpgradeClick : undefined
      }
      isButtonDisabled={isLoading}
      isButtonLoading={isLoading}
    />
  );
};
