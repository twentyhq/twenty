import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import {
  H2Title,
  IconBox,
  IconCalendarEvent,
  IconCalendarRepeat,
  IconCircleX,
  IconCoins,
  IconCreditCard,
  IconExternalLink,
  IconId,
  IconStatusChange,
  IconTag,
  IconUsers,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { PlansTags } from '@/settings/billing/components/internal/PlansTags';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
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
const RESOURCE_CREDIT_KEY = 'RESOURCE_CREDIT';
const EM_DASH = '\u2014';

type SettingsAdminWorkspaceBillingContentProps = {
  workspaceId: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledExternalLink = styled.a`
  align-items: center;
  color: inherit;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  text-decoration: none;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledMono = styled.span`
  font-family: ${themeCssVariables.code.font.family};
`;

const StyledItemValue = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
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

const StripeLink = ({
  path,
  id,
}: {
  path: 'customers' | 'subscriptions';
  id: string;
}) => (
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
    return (
      <StyledContainer>
        <SettingsSectionSkeletonLoader rowCount={6} />
      </StyledContainer>
    );
  }

  const billing = data?.workspaceBillingAdminPanel ?? null;

  if (!billing) {
    return (
      <StyledContainer>
        <Section>
          <H2Title
            title={t`Billing`}
            description={t`No billing data is available for this workspace.`}
          />
        </Section>
      </StyledContainer>
    );
  }

  const { stripeCustomerId, creditBalance, subscription } = billing;

  const customerItems = [
    {
      Icon: IconId,
      label: t`Stripe customer`,
      value: isDefined(stripeCustomerId) ? (
        <StripeLink path="customers" id={stripeCustomerId} />
      ) : (
        EM_DASH
      ),
    },
    {
      Icon: IconCoins,
      label: t`Credit balance`,
      value: isDefined(creditBalance)
        ? `${formatNumber(creditBalance, { abbreviate: true, decimals: 2 })} ${t`credits`}`
        : EM_DASH,
    },
  ];

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

  const formatItemValue = (
    item: NonNullable<typeof subscription>['items'][number],
  ): string => {
    const parts: string[] = [];

    if (isDefined(item.quantity)) {
      parts.push(`${formatNumber(item.quantity)} ${t`seats`}`);
    }
    if (isDefined(item.includedCredits)) {
      parts.push(
        `${formatNumber(item.includedCredits, { abbreviate: true, decimals: 2 })} ${t`credits/period`}`,
      );
    }
    if (isDefined(item.unitAmount) && isDefined(subscription)) {
      parts.push(formatCurrency(item.unitAmount, subscription.currency));
    }

    return parts.length > 0 ? parts.join(' · ') : EM_DASH;
  };

  const subscriptionItems = subscription
    ? [
        {
          Icon: IconCreditCard,
          label: t`Stripe subscription`,
          value: (
            <StripeLink
              path="subscriptions"
              id={subscription.stripeSubscriptionId}
            />
          ),
        },
        {
          Icon: IconStatusChange,
          label: t`Status`,
          value: (
            <Tag
              color={STATUS_COLORS[subscription.status]}
              text={STATUS_LABELS[subscription.status]}
            />
          ),
        },
        ...(isDefined(planKey)
          ? [
              {
                Icon: IconTag,
                label: t`Plan`,
                value: <PlansTags plan={planKey} isTrialPeriod={isTrialing} />,
              },
            ]
          : []),
        ...(isDefined(intervalLabel)
          ? [
              {
                Icon: IconCalendarEvent,
                label: t`Billing interval`,
                value: intervalLabel,
              },
            ]
          : []),
        {
          Icon: IconCalendarRepeat,
          label: t`Current period`,
          value: formatPeriod(
            subscription.currentPeriodStart,
            subscription.currentPeriodEnd,
          ),
        },
        ...(isDefined(subscription.trialStart) &&
        isDefined(subscription.trialEnd)
          ? [
              {
                Icon: IconCalendarRepeat,
                label: t`Trial period`,
                value: formatPeriod(
                  subscription.trialStart,
                  subscription.trialEnd,
                ),
              },
            ]
          : []),
        ...(subscription.cancelAtPeriodEnd
          ? [
              {
                Icon: IconCircleX,
                label: t`Cancels at period end`,
                value: t`Yes`,
              },
            ]
          : []),
        ...(isDefined(subscription.cancelAt)
          ? [
              {
                Icon: IconCircleX,
                label: t`Cancels at`,
                value: beautifyExactDate(subscription.cancelAt),
              },
            ]
          : []),
        ...(isDefined(subscription.canceledAt)
          ? [
              {
                Icon: IconCircleX,
                label: t`Canceled at`,
                value: beautifyExactDate(subscription.canceledAt),
              },
            ]
          : []),
        ...subscription.items.map((item) => ({
          Icon:
            item.productKey === BASE_PRODUCT_KEY
              ? IconUsers
              : item.productKey === METERED_PRODUCT_KEY ||
                  item.productKey === RESOURCE_CREDIT_KEY
                ? IconCoins
                : IconBox,
          label: item.productName || t`Unnamed product`,
          value: (
            <StyledItemValue>
              <span>{formatItemValue(item)}</span>
              {isDefined(item.productKey) && (
                <Tag color="gray" text={item.productKey} />
              )}
            </StyledItemValue>
          ),
        })),
      ]
    : [];

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title={t`Customer`}
          description={t`Stripe customer linked to this workspace`}
        />
        <SettingsTableCard
          rounded
          items={customerItems}
          gridAutoColumns="3fr 8fr"
        />
      </Section>

      <Section>
        <H2Title
          title={t`Subscription`}
          description={
            subscription
              ? t`Current subscription state and line items`
              : t`No active subscription.`
          }
        />
        {subscription && (
          <SettingsTableCard
            rounded
            items={subscriptionItems}
            gridAutoColumns="3fr 8fr"
          />
        )}
      </Section>
    </StyledContainer>
  );
};
