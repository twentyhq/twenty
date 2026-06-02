import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { UsageBreakdownPieSection } from '@/settings/usage/components/UsageBreakdownPieSection';
import { UsageByUserTableSection } from '@/settings/usage/components/UsageByUserTableSection';
import { UsageDailyChartSection } from '@/settings/usage/components/UsageDailyChartSection';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { AI_OPERATION_TYPES } from '@/settings/usage/constants/AiOperationTypes';
import { useUsageAnalyticsData } from '@/settings/usage/hooks/useUsageAnalyticsData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { H2Title, IconLock } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsAiUsageTab = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const hasEnterpriseAccess =
    isBillingEnabled ||
    currentWorkspace?.hasValidEnterpriseValidityToken === true;

  const shouldSkipQuery = !hasEnterpriseAccess || !isClickHouseConfigured;

  const { analytics, isInitialLoading } = useUsageAnalyticsData({
    operationTypes: AI_OPERATION_TYPES,
    skip: shouldSkipQuery,
  });

  if (!hasEnterpriseAccess) {
    return (
      <Section>
        <H2Title
          title={t`AI Usage`}
          description={t`Track AI consumption across your workspace.`}
          adornment={
            <Tag
              text={t`Enterprise`}
              color="transparent"
              Icon={IconLock}
              variant="border"
            />
          }
        />
        <SettingsEnterpriseFeatureGateCard
          title={t`Enterprise feature`}
          description={t`AI usage analytics is available with an Enterprise key.`}
          buttonTitle={t`Activate`}
        />
      </Section>
    );
  }

  if (!isClickHouseConfigured) {
    return (
      <Section>
        <H2Title
          title={t`AI Usage`}
          description={t`Track AI consumption across your workspace.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`ClickHouse Not Configured`}
            value={t`AI usage analytics requires ClickHouse. Contact your administrator.`}
          />
        </SubscriptionInfoContainer>
      </Section>
    );
  }

  if (isInitialLoading) {
    return <UsageSectionSkeleton />;
  }

  const hasData =
    analytics &&
    (analytics.timeSeries.length > 0 ||
      analytics.usageByOperationType.length > 0 ||
      analytics.usageByModel.length > 0 ||
      analytics.usageByUser.length > 0);

  if (!hasData) {
    return (
      <Section>
        <H2Title
          title={t`AI Usage`}
          description={t`Track AI consumption across your workspace.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`No usage data yet`}
            value={t`AI usage analytics will appear here once you start using AI features.`}
          />
        </SubscriptionInfoContainer>
      </Section>
    );
  }

  return (
    <>
      <UsageDailyChartSection
        title={t`Daily AI Usage`}
        description={t`AI consumption over time.`}
        operationTypes={AI_OPERATION_TYPES}
        chartId="ai-usage-daily"
        chartLabel={t`AI Usage`}
      />
      <UsageBreakdownPieSection
        title={t`AI Usage by Type`}
        operationTypes={AI_OPERATION_TYPES}
        breakdownField="operationType"
        sectionId="ai-usage-type"
      />
      <UsageBreakdownPieSection
        title={t`AI Usage by Model`}
        description={t`Breakdown across AI models.`}
        operationTypes={AI_OPERATION_TYPES}
        breakdownField="model"
        sectionId="ai-usage-model"
      />
      <UsageByUserTableSection
        title={t`AI Usage by User`}
        description={t`Click a user to see their daily breakdown.`}
        operationTypes={AI_OPERATION_TYPES}
        getDetailPath={(userWorkspaceId) =>
          getSettingsPath(SettingsPath.AiUsageUserDetail, {
            userWorkspaceId,
          })
        }
      />
    </>
  );
};
