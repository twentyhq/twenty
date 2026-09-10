import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { SettingsBillingLimitsTable } from '@/settings/billing/components/SettingsBillingLimitsTable';
import { useUsageQuotasWithConsumption } from '@/settings/billing/hooks/useUsageQuotasWithConsumption';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
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
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Limits`}
            description={t`Caps on what your workspace can spend and who they apply to`}
          />
          <SettingsEmptyPlaceholder>
            {t`No limit yet.`}
          </SettingsEmptyPlaceholder>
        </Section>
      </SettingsPageContainer>
    );
  }

  return (
    <SettingsPageContainer>
      <SettingsBillingLimitsTable quotas={usageQuotasWithConsumption} />
    </SettingsPageContainer>
  );
};
