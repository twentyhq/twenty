import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingCreditsSection } from '@/settings/billing/components/SettingsBillingCreditsSection';
import { SettingsBillingSubscriptionInfo } from '@/settings/billing/components/SettingsBillingSubscriptionInfo';
import { SettingsBillingTrialNoPaymentMethodBanner } from '@/settings/billing/components/SettingsBillingTrialNoPaymentMethodBanner';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconCircleX, IconCreditCard } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SubscriptionStatus } from '~/generated-metadata/graphql';
export const SettingsBillingContent = () => {
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;

  const subscriptionStatus = useSubscriptionStatus();
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  const { isGetResourceCreditUsageQueryLoaded: isUsageQueryLoaded } =
    useGetResourceCreditUsage();

  const displayTrialNoPaymentMethodCard =
    subscriptionStatus === SubscriptionStatus.Trialing &&
    billingHasPaymentMethod === false;

  const hasNotCanceledCurrentSubscription =
    isDefined(subscriptionStatus) &&
    subscriptionStatus !== SubscriptionStatus.Canceled;
  const hasScheduledCancellation =
    currentBillingSubscription?.status !== SubscriptionStatus.Canceled &&
    isDefined(currentBillingSubscription?.cancelAt);
  const canCancelCurrentSubscription =
    hasNotCanceledCurrentSubscription && !hasScheduledCancellation;

  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.Billing));

  return (
    <SettingsPageContainer>
      {displayTrialNoPaymentMethodCard && currentBillingSubscription && (
        <SettingsBillingTrialNoPaymentMethodBanner
          currentBillingSubscription={currentBillingSubscription}
        />
      )}
      {hasNotCanceledCurrentSubscription &&
        currentWorkspace &&
        currentBillingSubscription && (
          <SettingsBillingSubscriptionInfo
            currentWorkspace={currentWorkspace}
            currentBillingSubscription={currentBillingSubscription}
            onUpdatePayment={openBillingPortal}
            isUpdatePaymentDisabled={isBillingPortalSessionDisabled}
          />
        )}
      {hasNotCanceledCurrentSubscription &&
        currentWorkspace &&
        currentBillingSubscription &&
        isUsageQueryLoaded && (
          <SettingsBillingCreditsSection
            currentBillingSubscription={currentBillingSubscription}
            onUpdatePayment={openBillingPortal}
            isUpdatePaymentDisabled={isBillingPortalSessionDisabled}
          />
        )}
      <Section>
        <H2Title
          title={t`Manage billing information`}
          description={t`Edit payment method, see your invoices and more`}
        />
        <Button
          Icon={IconCreditCard}
          title={t`View billing details`}
          variant="secondary"
          onClick={openBillingPortal}
          disabled={isBillingPortalSessionDisabled}
        />
      </Section>
      {canCancelCurrentSubscription && (
        <Section>
          <H2Title
            title={t`Cancel your subscription`}
            description={t`Your workspace will be disabled`}
          />
          <Button
            Icon={IconCircleX}
            title={t`Cancel Plan`}
            variant="secondary"
            accent="danger"
            onClick={openBillingPortal}
            disabled={isBillingPortalSessionDisabled}
          />
        </Section>
      )}
    </SettingsPageContainer>
  );
};
