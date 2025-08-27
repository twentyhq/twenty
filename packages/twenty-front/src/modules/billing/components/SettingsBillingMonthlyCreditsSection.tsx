import { SettingsBillingLabelValueItem } from '@/billing/components/SettingsBillingLabelValueItem';
import { useGetWorkflowNodeExecutionUsage } from '@/billing/hooks/useGetWorkflowNodeExecutionUsage';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { BACKGROUND_LIGHT, COLOR } from 'twenty-ui/theme';
import { SubscriptionStatus } from '~/generated/graphql';
import { formatAmount } from '~/utils/format/formatAmount';
import { formatNumber } from '~/utils/format/number';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { useListAvailableMeteredBillingPricesQuery } from '~/generated-metadata/graphql';
import { MeteredPriceSelector } from '@/billing/components/internal/MeteredPriceSelector';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

const StyledLineSeparator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.background.tertiary};
`;

export const SettingsBillingMonthlyCreditsSection = ({
  currentWorkspace,
}: {
  currentWorkspace: CurrentWorkspace;
}) => {
  const subscriptionStatus = useSubscriptionStatus();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const {
    freeUsageQuantity,
    includedFreeQuantity,
    paidUsageQuantity,
    unitPriceCents,
    totalCostCents,
  } = useGetWorkflowNodeExecutionUsage();

  const { data: meteredBillingPrices } =
    useListAvailableMeteredBillingPricesQuery();

  const isFreeCreditProgressBarCompleted =
    freeUsageQuantity === includedFreeQuantity;

  const progressBarValue = (freeUsageQuantity / includedFreeQuantity) * 100;

  const formattedFreeUsageQuantity = isFreeCreditProgressBarCompleted
    ? formatAmount(freeUsageQuantity)
    : formatNumber(freeUsageQuantity);

  return (
    <>
      <Section>
        <H2Title
          title={t`Monthly Credits`}
          description={t`Track your monthly workflow credit consumption.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`Credits Used`}
            value={`${formattedFreeUsageQuantity}/${formatAmount(includedFreeQuantity)}`}
          />
          <ProgressBar
            value={progressBarValue}
            barColor={
              isFreeCreditProgressBarCompleted
                ? BACKGROUND_LIGHT.quaternary
                : COLOR.blue
            }
            backgroundColor={BACKGROUND_LIGHT.tertiary}
            withBorderRadius={true}
          />

          <StyledLineSeparator />
          {!isTrialing && (
            <SettingsBillingLabelValueItem
              label={t`Extra Credits Used`}
              value={`${formatNumber(paidUsageQuantity)}`}
            />
          )}
          <SettingsBillingLabelValueItem
            label={t`Cost per 1k Extra Credits`}
            value={`$${formatNumber((unitPriceCents / 100) * 1000, 2)}`}
          />
          {!isTrialing && (
            <SettingsBillingLabelValueItem
              label={t`Cost`}
              isValueInPrimaryColor={true}
              value={`$${formatNumber(totalCostCents / 100, 2)}`}
            />
          )}
        </SubscriptionInfoContainer>
      </Section>
      <Section>
        {meteredBillingPrices?.listAvailableMeteredBillingPrices && (
          <MeteredPriceSelector
            billingSubscriptionItems={
              currentWorkspace.currentBillingSubscription
                ?.billingSubscriptionItems ?? []
            }
            meteredBillingPrices={
              meteredBillingPrices.listAvailableMeteredBillingPrices
            }
          />
        )}
      </Section>
    </>
  );
};
