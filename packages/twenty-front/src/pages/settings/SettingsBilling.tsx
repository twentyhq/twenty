import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingMonthlyCreditsSection } from '@/billing/components/SettingsBillingMonthlyCreditsSection';
import { SettingsBillingSubscriptionInfo } from '@/billing/components/SettingsBillingSubscriptionInfo';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconCircleX, IconCreditCard } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  SubscriptionStatus,
  useBillingPortalSessionQuery,
} from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsBilling = () => {
  const { t } = useLingui();

  const { redirect } = useRedirect();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const subscriptions = currentWorkspace?.billingSubscriptions;

  const hasSubscriptions = (subscriptions?.length ?? 0) > 0;

  const subscriptionStatus = useSubscriptionStatus();

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
    <SubMenuTopBarContainer
      title={t`Billing`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Billing</Trans> },
      ]}
    >
      <SettingsPageContainer>
        {hasNotCanceledCurrentSubscription && (
          <SettingsBillingSubscriptionInfo />
        )}
        {hasNotCanceledCurrentSubscription && (
          <SettingsBillingMonthlyCreditsSection />
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
    </SubMenuTopBarContainer>
  );
};
