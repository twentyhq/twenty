import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { SettingsBillingLimitsTable } from '@/settings/billing/components/SettingsBillingLimitsTable';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useUsageQuotasWithConsumption } from '@/settings/billing/hooks/useUsageQuotasWithConsumption';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';

export const SettingsBillingLimitsContent = () => {
  const { t } = useLingui();
  const { usageQuotasWithConsumption, loading, error } =
    useUsageQuotasWithConsumption();

  if (loading) {
    return <UsageSectionSkeleton />;
  }

  if (isDefined(error)) {
    return (
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Limits`}
            description={t`Limits could not be loaded.`}
          />
        </Section>
      </SettingsPageContainer>
    );
  }

  if (usageQuotasWithConsumption.length === 0) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.BillingNewLimit)} replace />
    );
  }

  return (
    <SettingsPageContainer>
      <SettingsBillingLimitsTable quotas={usageQuotasWithConsumption} />
    </SettingsPageContainer>
  );
};
