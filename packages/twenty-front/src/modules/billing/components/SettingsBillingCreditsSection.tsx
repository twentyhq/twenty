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
import {
  getIntervalLabel,
  isMonthlyPlan,
} from '@/billing/utils/subscriptionFlags';

const StyledLineSeparator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.background.tertiary};
`;

export const SettingsBillingCreditsSection = ({
  currentWorkspace,
}: {
  currentWorkspace: CurrentWorkspace;
}) => {
  const subscriptionStatus = useSubscriptionStatus();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const { usedCredits, grantedCredits, unitPriceCents } =
    useGetWorkflowNodeExecutionUsage();

  const { data: meteredBillingPrices } =
    useListAvailableMeteredBillingPricesQuery();

  const progressBarValue = (usedCredits / grantedCredits) * 100;

  const intervalLabel = getIntervalLabel(isMonthlyPlan(currentWorkspace));

  return (
    <>
      <Section>
        <H2Title
          title={t`Credit Usage`}
          description={t`Track your ${intervalLabel} workflow credit consumption.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`Credits Used`}
            value={`${formatNumber(usedCredits)}/${formatAmount(grantedCredits)}`}
          />
          <ProgressBar
            value={progressBarValue}
            barColor={progressBarValue > 100 ? COLOR.red40 : COLOR.blue}
            backgroundColor={BACKGROUND_LIGHT.tertiary}
            withBorderRadius={true}
          />

          <StyledLineSeparator />
          {!isTrialing && (
            <SettingsBillingLabelValueItem
              label={t`Extra Credits Used`}
              value={`${formatNumber(Math.max(0, usedCredits - grantedCredits))}`}
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
              value={`$${formatNumber(((usedCredits - grantedCredits) * unitPriceCents) / 100, 2)}`}
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
            isTrialing={isTrialing}
          />
        )}
      </Section>
    </>
  );
};
