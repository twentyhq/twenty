import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { UsageBreakdownPieSection } from '@/settings/usage/components/UsageBreakdownPieSection';
import { UsageByUserTableSection } from '@/settings/usage/components/UsageByUserTableSection';
import { UsageDailyChartSection } from '@/settings/usage/components/UsageDailyChartSection';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useUsageAnalyticsData } from '@/settings/usage/hooks/useUsageAnalyticsData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconSparkles } from 'twenty-ui/icon';
import { SETTINGS_AI_TABS } from '~/pages/settings/ai/constants/SettingsAiTabs';

export const SettingsUsageAnalyticsSection = () => {
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const { analytics, isInitialLoading } = useUsageAnalyticsData({
    skip: !isClickHouseConfigured,
  });

  if (!isClickHouseConfigured) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Usage Analytics`}
          description={t`Credit usage breakdown for your workspace.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`ClickHouse Not Configured`}
            value={t`Usage analytics requires ClickHouse. Contact your administrator.`}
          />
        </SubscriptionInfoContainer>
      </Section.Root>
    );
  }

  if (isInitialLoading) {
    return <UsageSectionSkeleton />;
  }

  const hasData =
    analytics &&
    (analytics.timeSeries.length > 0 ||
      analytics.usageByOperationType.length > 0 ||
      analytics.usageByUser.length > 0);

  if (!hasData) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Usage Analytics`}
          description={t`Credit usage breakdown for your workspace.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`No usage data yet`}
            value={t`Usage analytics will appear here once you start using credits.`}
          />
        </SubscriptionInfoContainer>
      </Section.Root>
    );
  }

  return (
    <>
      <UsageBreakdownPieSection
        title={t`Usage by Type`}
        breakdownField="operationType"
        sectionId="usage-type"
      />
      <UsageBreakdownPieSection
        title={t`Usage by App`}
        breakdownField="application"
        sectionId="usage-app"
      />
      <UsageDailyChartSection
        title={t`Daily Usage`}
        description={t`Credit consumption over time.`}
        chartId="usage-daily"
        chartLabel={t`Credits`}
      />
      <UsageByUserTableSection
        title={t`Usage by User`}
        description={t`Click a user to see their daily breakdown.`}
        getDetailPath={(userWorkspaceId) =>
          getSettingsPath(SettingsPath.UsageUserDetail, {
            userWorkspaceId,
          })
        }
        showAvatar
      />
      <Section.Root>
        <NavigationButton
          to={`${getSettingsPath(SettingsPath.AI)}#${SETTINGS_AI_TABS.TABS_IDS.USAGE}`}
          startIcon={<IconSparkles />}
          variant="outline"
        >{t`View AI usage breakdown`}</NavigationButton>
      </Section.Root>
    </>
  );
};
