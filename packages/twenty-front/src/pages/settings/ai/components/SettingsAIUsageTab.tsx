import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { UsageBreakdownPieSection } from '@/settings/usage/components/UsageBreakdownPieSection';
import { UsageByUserTableSection } from '@/settings/usage/components/UsageByUserTableSection';
import { UsageDailyChartSection } from '@/settings/usage/components/UsageDailyChartSection';
import { AI_OPERATION_TYPES } from '@/settings/usage/constants/AiOperationTypes';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { H2Title, IconLock } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsAIUsageTab = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const hasEnterpriseAccess =
    isBillingEnabled || currentWorkspace?.hasValidEnterpriseKey === true;

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
          description={t`AI usage analytics is available with an Enterprise key.`}
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
          getSettingsPath(SettingsPath.AIUsageUserDetail, {
            userWorkspaceId,
          })
        }
      />
    </>
  );
};
