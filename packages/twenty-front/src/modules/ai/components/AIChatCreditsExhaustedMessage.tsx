import { AIChatBanner } from '@/ai/components/AIChatBanner';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/display';
import {
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const AIChatCreditsExhaustedMessage = () => {
  const navigateSettings = useNavigateSettings();
  const subscriptionStatus = useSubscriptionStatus();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  const handleUpgradeClick = () => {
    navigateSettings(SettingsPath.Billing);
  };

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
    />
  );
};
