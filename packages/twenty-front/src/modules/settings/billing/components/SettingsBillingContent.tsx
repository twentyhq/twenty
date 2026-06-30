import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SettingsBillingCreditsSection } from '@/settings/billing/components/SettingsBillingCreditsSection';
import { SettingsBillingSubscriptionInfo } from '@/settings/billing/components/SettingsBillingSubscriptionInfo';
import { SettingsBillingTrialNoPaymentMethodBanner } from '@/settings/billing/components/SettingsBillingTrialNoPaymentMethodBanner';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleX, IconCreditCard } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  BillingPortalSessionDocument,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';
export const SettingsBillingContent = () => {
  const { t } = useLingui();

  const { redirect } = useRedirect();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;

  const subscriptions = currentWorkspace?.billingSubscriptions;

  const hasSubscriptions = (subscriptions?.length ?? 0) > 0;

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

  const { data, loading } = useQuery(BillingPortalSessionDocument, {
    variables: {
      returnUrlPath: '/settings/billing',
    },
    skip: !hasSubscriptions,
  });

  const billingPortalButtonDisabled =
    loading || !isDefined(data) || !isDefined(data.billingPortalSession.url);

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

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
            isUpdatePaymentDisabled={billingPortalButtonDisabled}
          />
        )}
      {hasNotCanceledCurrentSubscription &&
        currentWorkspace &&
        currentBillingSubscription &&
        isUsageQueryLoaded && (
          <SettingsBillingCreditsSection
            currentBillingSubscription={currentBillingSubscription}
            onUpdatePayment={openBillingPortal}
            isUpdatePaymentDisabled={billingPortalButtonDisabled}
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
          disabled={billingPortalButtonDisabled}
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
            disabled={billingPortalButtonDisabled}
          />
        </Section>
      )}
    </SettingsPageContainer>
  );
};
