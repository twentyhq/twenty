import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { SettingsBillingLimitsEmptyState } from '@/settings/billing/components/SettingsBillingLimitsEmptyState';
import { SettingsBillingLimitsTable } from '@/settings/billing/components/SettingsBillingLimitsTable';
import { useUsageQuotasWithConsumption } from '@/settings/billing/hooks/useUsageQuotasWithConsumption';
import { hasKnownUsageLimitSpender } from '@/settings/billing/utils/hasKnownUsageLimitSpender';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Section } from 'twenty-ui/components/layout';

export const SettingsBillingLimitsContent = () => {
  const { t } = useLingui();
  const { usageQuotasWithConsumption, loading, error } =
    useUsageQuotasWithConsumption();

  const quotas = usageQuotasWithConsumption.filter(hasKnownUsageLimitSpender);

  if (loading) {
    return null;
  }

  if (isDefined(error)) {
    return (
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`Limits`}
            description={t`Limits could not be loaded.`}
          />
        </Section.Root>
      </SettingsPageContainer>
    );
  }

  if (quotas.length === 0) {
    return <SettingsBillingLimitsEmptyState />;
  }

  return (
    <SettingsPageContainer>
      <SettingsBillingLimitsTable quotas={quotas} />
    </SettingsPageContainer>
  );
};
