import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SettingsBillingLimitEditForm } from '@/settings/billing/components/SettingsBillingLimitEditForm';
import { useUsageQuotasWithConsumption } from '@/settings/billing/hooks/useUsageQuotasWithConsumption';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { NotFound } from '~/pages/not-found/NotFound';

export const SettingsBillingLimitEdit = () => {
  const { usageLimitId = '' } = useParams();
  const { usageQuotasWithConsumption, loading } =
    useUsageQuotasWithConsumption();

  if (loading) {
    return <UsageSectionSkeleton />;
  }

  const quota = usageQuotasWithConsumption.find(
    (candidate) => candidate.id === usageLimitId,
  );

  if (!isDefined(quota)) {
    return <NotFound />;
  }

  return (
    <SettingsBillingLimitEditForm
      key={usageLimitId}
      usageLimitId={usageLimitId}
      quota={quota}
    />
  );
};
