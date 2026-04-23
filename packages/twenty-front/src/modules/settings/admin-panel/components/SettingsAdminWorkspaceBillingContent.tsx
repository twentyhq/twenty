import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { H2Title, IconExternalLink, IconInfoCircle } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { PlansTags } from '@/settings/billing/components/internal/PlansTags';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { beautifyExactDate } from '~/utils/date-utils';
import { BillingPlanKey } from '~/generated-metadata/graphql';
import {
  SubscriptionInterval,
  SubscriptionStatus,
  type WorkspaceBillingAdminPanelQuery,
} from '~/generated-admin/graphql';

const STRIPE_DASHBOARD_BASE_URL = 'https://dashboard.stripe.com';
const BASE_PRODUCT_KEY = 'BASE_PRODUCT';
const METERED_PRODUCT_KEY = 'WORKFLOW_NODE_EXECUTION';

type SettingsAdminWorkspaceBillingContentProps = {
  workspaceId: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledItemHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledExternalLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  text-decoration: none;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledMono = styled.span`
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.xs};
`;

const STATUS_COLORS: Record<SubscriptionStatus, ThemeColor> = {
  [SubscriptionStatus.Active]: 'green',
  [SubscriptionStatus.Trialing]: 'blue',
  [SubscriptionStatus.PastDue]: 'orange',
  [SubscriptionStatus.Canceled]: 'red',
  [SubscriptionStatus.Unpaid]: 'red',
  [SubscriptionStatus.Paused]: 'gray',
  [SubscriptionStatus.Incomplete]: 'gray',
  [SubscriptionStatus.IncompleteExpired]: 'gray',
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.Active]: 'Active',
  [SubscriptionStatus.Trialing]: 'Trialing',
  [SubscriptionStatus.PastDue]: 'Past Due',
  [SubscriptionStatus.Canceled]: 'Canceled',
  [SubscriptionStatus.Unpaid]: 'Unpaid',
  [SubscriptionStatus.Paused]: 'Paused',
  [SubscriptionStatus.Incomplete]: 'Incomplete',
  [SubscriptionStatus.IncompleteExpired]: 'Incomplete Expired',
};

const formatCurrency = (amountMinor: number, currency: string): string => {
  const normalizedCurrency = currency.toUpperCase();

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${normalizedCurrency}`;
  }
};

const toBillingPlanKey = (planKey: string): BillingPlanKey | null =>
  planKey === BillingPlanKey.PRO
    ? BillingPlanKey.PRO
    : planKey === BillingPlanKey.ENTERPRISE
      ? BillingPlanKey.ENTERPRISE
      : null;

const StripeCustomerLink = ({ id }: { id: string }) => (
  <StyledExternalLink
    href={`${STRIPE_DASHBOARD_BASE_URL}/customers/${id}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <StyledMono>{id}</StyledMono>
    <IconExternalLink size={12} />
  </StyledExternalLink>
);

const StripeSubscriptionLink = ({ id }: { id: string }) => (
  <StyledExternalLink
    href={`${STRIPE_DASHBOARD_BASE_URL}/subscriptions/${id}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <StyledMono>{id}</StyledMono>
    <IconExternalLink size={12} />
  </StyledExternalLink>
);

export const SettingsAdminWorkspaceBillingContent = ({
  workspaceId,
}: SettingsAdminWorkspaceBillingContentProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const apolloAdminClient = useApolloAdminClient();

  const { data, loading } = useQuery<WorkspaceBillingAdminPanelQuery>(
    GET_WORKSPACE_BILLING_ADMIN_PANEL,
    {
      client: apolloAdminClient,
      variables: { workspaceId },
      skip: !workspaceId,
    },
  );

  if (loading) {
    return <SettingsSkeletonLoader />;
  }

  const billing = data?.workspaceBillingAdminPanel ?? null;

  if (!billing) {
    return (
      <StyledContainer>
        <Section>
          <H2Title
            title={t`Billing`}
            description={t`Stripe customer and subscription details`}
          />
          <SubscriptionInfoContainer>
            <StyledEmptyState>
              <IconInfoCircle size={14} />
              {t`No billing data available for this workspace.`}
            </StyledEmptyState>
          </SubscriptionInfoContainer>
        </Section>
      </StyledContainer>
    );
  }

  const { stripeCustomerId, creditBalance, subscription } = billing;

  const baseItem = subscription?.items.find(
    (item) => item.productKey === BASE_PRODUCT_KEY,
  );
  const meteredItem = subscription?.items.find(
    (item) => item.productKey === METERED_PRODUCT_KEY,
  );
  const otherItems =
    subscription?.items.filter(
      (item) => item !== baseItem && item !== meteredItem,
    ) ?? [];

  const intervalLabel =
    subscription?.interval === SubscriptionInterval.Month
      ? t`Monthly`
      : subscription?.interval === SubscriptionInterval.Year
        ? t`Yearly`
        : null;

  const formatPeriod = (start: string, end: string): string =>
    `${beautifyExactDate(start)} → ${beautifyExactDate(end)}`;

  const planKey = isDefined(subscription?.planKey)
    ? toBillingPlanKey(subscription.planKey)
    : null;
  const isTrialing = subscription?.status === SubscriptionStatus.Trialing;

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title={t`Customer`}
          description={t`Stripe customer linked to this workspace`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`Stripe customer`}
            value={
              isDefined(stripeCustomerId) ? (
                <StripeCustomerLink id={stripeCustomerId} />
              ) : (
                '\u2014'
              )
            }
          />
          <SettingsBillingLabelValueItem
            label={t`Credit balance`}
            value={
              isDefined(creditBalance)
                ? `${formatNumber(creditBalance, {
                    abbreviate: true,
                    decimals: 2,
                  })} ${t`credits`}`
                : '\u2014'
            }
          />
        </SubscriptionInfoContainer>
      </Section>

      <Section>
        <H2Title
          title={t`Subscription`}
          description={t`Current subscription state`}
        />
        {!subscription ? (
          <SubscriptionInfoContainer>
            <StyledEmptyState>
              <IconInfoCircle size={14} />
              {t`No active subscription.`}
            </StyledEmptyState>
          </SubscriptionInfoContainer>
        ) : (
          <SubscriptionInfoContainer>
            <SettingsBillingLabelValueItem
              label={t`Status`}
              value={
                <Tag
                  color={STATUS_COLORS[subscription.status]}
                  text={STATUS_LABELS[subscription.status]}
                />
              }
            />
            {isDefined(planKey) && (
              <SettingsBillingLabelValueItem
                label={t`Plan`}
                value={<PlansTags plan={planKey} isTrialPeriod={isTrialing} />}
              />
            )}
            {isDefined(intervalLabel) && (
              <SettingsBillingLabelValueItem
                label={t`Billing interval`}
                value={intervalLabel}
              />
            )}
            <SettingsBillingLabelValueItem
              label={t`Current period`}
              value={formatPeriod(
                subscription.currentPeriodStart,
                subscription.currentPeriodEnd,
              )}
            />
            {isDefined(subscription.trialStart) &&
              isDefined(subscription.trialEnd) && (
                <SettingsBillingLabelValueItem
                  label={t`Trial period`}
                  value={formatPeriod(
                    subscription.trialStart,
                    subscription.trialEnd,
                  )}
                />
              )}
            {subscription.cancelAtPeriodEnd && (
              <SettingsBillingLabelValueItem
                label={t`Cancels at period end`}
                value={t`Yes`}
              />
            )}
            {isDefined(subscription.cancelAt) && (
              <SettingsBillingLabelValueItem
                label={t`Cancels at`}
                value={beautifyExactDate(subscription.cancelAt)}
              />
            )}
            {isDefined(subscription.canceledAt) && (
              <SettingsBillingLabelValueItem
                label={t`Canceled at`}
                value={beautifyExactDate(subscription.canceledAt)}
              />
            )}
            <SettingsBillingLabelValueItem
              label={t`Stripe subscription`}
              value={
                <StripeSubscriptionLink
                  id={subscription.stripeSubscriptionId}
                />
              }
            />
          </SubscriptionInfoContainer>
        )}
      </Section>

      {isDefined(subscription) && subscription.items.length > 0 && (
        <Section>
          <H2Title
            title={t`Line items`}
            description={t`Products included in this subscription`}
          />
          <StyledItemsContainer>
            {[baseItem, meteredItem, ...otherItems]
              .filter(isDefined)
              .map((item) => (
                <SubscriptionInfoContainer key={item.stripePriceId}>
                  <StyledItemHeader>
                    <span>{item.productName || t`Unnamed product`}</span>
                    {isDefined(item.productKey) && (
                      <Tag color="gray" text={item.productKey} />
                    )}
                  </StyledItemHeader>
                  {isDefined(item.quantity) && (
                    <SettingsBillingLabelValueItem
                      label={t`Seats`}
                      value={formatNumber(item.quantity)}
                    />
                  )}
                  {isDefined(item.includedCredits) && (
                    <SettingsBillingLabelValueItem
                      label={t`Credits per period`}
                      value={formatNumber(item.includedCredits, {
                        abbreviate: true,
                        decimals: 2,
                      })}
                    />
                  )}
                  {isDefined(item.unitAmount) && (
                    <SettingsBillingLabelValueItem
                      label={t`Unit price`}
                      value={formatCurrency(
                        item.unitAmount,
                        subscription.currency,
                      )}
                    />
                  )}
                </SubscriptionInfoContainer>
              ))}
          </StyledItemsContainer>
        </Section>
      )}
    </StyledContainer>
  );
};
