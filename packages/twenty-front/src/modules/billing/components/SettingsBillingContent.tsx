import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingAnalyticsSection } from '@/billing/components/SettingsBillingAnalyticsSection';
import { SettingsBillingCreditsSection } from '@/billing/components/SettingsBillingCreditsSection';
import { SettingsBillingSubscriptionInfo } from '@/billing/components/SettingsBillingSubscriptionInfo';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined, getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import {
  H2Title,
  IconChartBar,
  IconCircleX,
  IconCreditCard,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  SubscriptionStatus,
  useBillingPortalSessionQuery,
} from '~/generated-metadata/graphql';
import { useGetWorkflowNodeExecutionUsage } from '@/billing/hooks/useGetWorkflowNodeExecutionUsage';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsBillingContent = () => {
  const { t } = useLingui();

  const { redirect } = useRedirect();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const subscriptions = currentWorkspace?.billingSubscriptions;

  const hasSubscriptions = (subscriptions?.length ?? 0) > 0;

  const subscriptionStatus = useSubscriptionStatus();

  const { isGetMeteredProductsUsageQueryLoaded } =
    useGetWorkflowNodeExecutionUsage();

  const hasNotCanceledCurrentSubscription =
    isDefined(subscriptionStatus) &&
    subscriptionStatus !== SubscriptionStatus.Canceled;

  const { data, loading } = useBillingPortalSessionQuery({
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
      {hasNotCanceledCurrentSubscription &&
        currentWorkspace &&
        currentWorkspace.currentBillingSubscription && (
          <SettingsBillingSubscriptionInfo
            currentWorkspace={currentWorkspace}
            currentBillingSubscription={
              currentWorkspace.currentBillingSubscription
            }
          />
        )}
      {hasNotCanceledCurrentSubscription &&
        currentWorkspace &&
        currentWorkspace.currentBillingSubscription &&
        isGetMeteredProductsUsageQueryLoaded && (
          <SettingsBillingCreditsSection
            currentBillingSubscription={
              currentWorkspace.currentBillingSubscription
            }
          />
        )}
      <SettingsBillingAnalyticsSection />
      <Section>
        <H2Title
          title={t`Usage`}
          description={t`View detailed usage analytics for your workspace`}
        />
        <Link to={getSettingsPath(SettingsPath.Usage)}>
          <Button
            Icon={IconChartBar}
            title={t`View usage`}
            variant="secondary"
          />
        </Link>
      </Section>
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
      {hasNotCanceledCurrentSubscription && (
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
