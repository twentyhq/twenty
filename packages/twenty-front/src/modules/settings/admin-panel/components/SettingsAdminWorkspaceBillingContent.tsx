import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { H2Title, IconExternalLink, IconInfoCircle } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { beautifyExactDate } from '~/utils/date-utils';
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

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
  min-width: 0;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledValue = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMono = styled.span`
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.xs};
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

const StyledItemCard = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
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

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const getStatusColor = (status: SubscriptionStatus): ThemeColor => {
  switch (status) {
    case SubscriptionStatus.Active:
      return 'green';
    case SubscriptionStatus.Trialing:
      return 'blue';
    case SubscriptionStatus.PastDue:
      return 'orange';
    case SubscriptionStatus.Canceled:
    case SubscriptionStatus.Unpaid:
      return 'red';
    case SubscriptionStatus.Paused:
    case SubscriptionStatus.Incomplete:
    case SubscriptionStatus.IncompleteExpired:
    default:
      return 'gray';
  }
};

const formatStatusLabel = (status: SubscriptionStatus): string =>
  status.replace(/([A-Z])/g, ' $1').trim();

const formatPlanLabel = (planKey: string): string => {
  const normalized = planKey.toUpperCase();

  if (normalized === 'PRO') return 'Pro';
  if (normalized === 'ENTERPRISE') return 'Organization';

  return planKey;
};

const getPlanColor = (planKey: string): ThemeColor => {
  const normalized = planKey.toUpperCase();

  if (normalized === 'PRO') return 'sky';
  if (normalized === 'ENTERPRISE') return 'purple';

  return 'gray';
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

const LabelValueRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <StyledRow>
    <StyledLabel>{label}</StyledLabel>
    <StyledValue>{value}</StyledValue>
  </StyledRow>
);

const StripeIdLink = ({ path, id }: { path: string; id: string }) => (
  <StyledExternalLink
    href={`${STRIPE_DASHBOARD_BASE_URL}/${path}/${id}`}
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

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title={t`Customer`}
          description={t`Stripe customer linked to this workspace`}
        />
        <SubscriptionInfoContainer>
          <LabelValueRow
            label={t`Stripe customer`}
            value={
              isDefined(stripeCustomerId) ? (
                <StripeIdLink path="customers" id={stripeCustomerId} />
              ) : (
                '\u2014'
              )
            }
          />
          <LabelValueRow
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
            <LabelValueRow
              label={t`Status`}
              value={
                <Tag
                  color={getStatusColor(subscription.status)}
                  text={formatStatusLabel(subscription.status)}
                />
              }
            />
            {isDefined(subscription.planKey) && (
              <LabelValueRow
                label={t`Plan`}
                value={
                  <Tag
                    color={getPlanColor(subscription.planKey)}
                    text={formatPlanLabel(subscription.planKey)}
                  />
                }
              />
            )}
            {isDefined(intervalLabel) && (
              <LabelValueRow
                label={t`Billing interval`}
                value={intervalLabel}
              />
            )}
            <LabelValueRow
              label={t`Current period`}
              value={formatPeriod(
                subscription.currentPeriodStart,
                subscription.currentPeriodEnd,
              )}
            />
            {isDefined(subscription.trialStart) &&
              isDefined(subscription.trialEnd) && (
                <LabelValueRow
                  label={t`Trial period`}
                  value={formatPeriod(
                    subscription.trialStart,
                    subscription.trialEnd,
                  )}
                />
              )}
            {subscription.cancelAtPeriodEnd && (
              <LabelValueRow label={t`Cancels at period end`} value={t`Yes`} />
            )}
            {isDefined(subscription.cancelAt) && (
              <LabelValueRow
                label={t`Cancels at`}
                value={beautifyExactDate(subscription.cancelAt)}
              />
            )}
            {isDefined(subscription.canceledAt) && (
              <LabelValueRow
                label={t`Canceled at`}
                value={beautifyExactDate(subscription.canceledAt)}
              />
            )}
            <LabelValueRow
              label={t`Stripe subscription`}
              value={
                <StripeIdLink
                  path="subscriptions"
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
                <StyledItemCard key={item.stripePriceId}>
                  <StyledItemHeader>
                    <span>{item.productName || t`Unnamed product`}</span>
                    {isDefined(item.productKey) && (
                      <Tag color="gray" text={item.productKey} />
                    )}
                  </StyledItemHeader>
                  {isDefined(item.quantity) && (
                    <LabelValueRow
                      label={t`Seats`}
                      value={formatNumber(item.quantity)}
                    />
                  )}
                  {isDefined(item.includedCredits) && (
                    <LabelValueRow
                      label={t`Credits per period`}
                      value={formatNumber(item.includedCredits, {
                        abbreviate: true,
                        decimals: 2,
                      })}
                    />
                  )}
                  {isDefined(item.unitAmount) && isDefined(subscription) && (
                    <LabelValueRow
                      label={t`Unit price`}
                      value={formatCurrency(
                        item.unitAmount,
                        subscription.currency,
                      )}
                    />
                  )}
                </StyledItemCard>
              ))}
          </StyledItemsContainer>
        </Section>
      )}
    </StyledContainer>
  );
};
