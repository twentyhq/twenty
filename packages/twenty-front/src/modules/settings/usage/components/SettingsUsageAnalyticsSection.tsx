import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { UsageBreakdownPieSection } from '@/settings/usage/components/UsageBreakdownPieSection';
import { UsageByUserTableSection } from '@/settings/usage/components/UsageByUserTableSection';
import { UsageDailyChartSection } from '@/settings/usage/components/UsageDailyChartSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconSparkles } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SETTINGS_AI_TABS } from '~/pages/settings/ai/constants/SettingsAiTabs';

export const SettingsUsageAnalyticsSection = () => {
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  if (!isClickHouseConfigured) {
    return (
      <Section>
        <H2Title
          title={t`Usage Analytics`}
          description={t`Credit usage breakdown for your workspace.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`ClickHouse Not Configured`}
            value={t`Usage analytics requires ClickHouse. Contact your administrator.`}
          />
        </SubscriptionInfoContainer>
      </Section>
    );
  }

  return (
    <>
      <UsageBreakdownPieSection
        title={t`Usage by Type`}
        breakdownField="operationType"
        sectionId="usage-type"
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
      <Section>
        <Link
          to={`${getSettingsPath(SettingsPath.AI)}#${SETTINGS_AI_TABS.TABS_IDS.USAGE}`}
          style={{ textDecoration: 'none' }}
        >
          <Button
            Icon={IconSparkles}
            title={t`View AI usage breakdown`}
            variant="secondary"
          />
        </Link>
      </Section>
    </>
  );
};
