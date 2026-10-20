import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { ApplicationMonitoring } from '@/settings/application-monitoring/components/ApplicationMonitoring';
import { ApplicationMonitoringFallback } from '@/settings/application-monitoring/components/ApplicationMonitoringFallback';
import { buildApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/utils/buildApplicationMonitoringPeriodRange';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type ApplicationRegistration,
  FindApplicationRegistrationMonitoringDocument,
} from '~/generated-metadata/graphql';

export const SettingsApplicationRegistrationMonitoringTab = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const [periodRange, setPeriodRange] = useState(() =>
    buildApplicationMonitoringPeriodRange('7d'),
  );

  const { data, error } = useQuery(
    FindApplicationRegistrationMonitoringDocument,
    {
      variables: {
        id: registration.id,
        periodStart: periodRange.periodStart,
        periodEnd: periodRange.periodEnd,
      },
      skip: !isClickHouseConfigured,
    },
  );

  const monitoring = data?.findApplicationRegistrationMonitoring;

  if (isClickHouseConfigured && !isDefined(error) && isDefined(monitoring)) {
    return (
      <ApplicationMonitoring
        instanceId={`application-registration-monitoring-${registration.id}`}
        monitoring={monitoring}
        selectedPeriod={periodRange.period}
        onPeriodChange={(period) =>
          setPeriodRange(buildApplicationMonitoringPeriodRange(period))
        }
      />
    );
  }

  return (
    <ApplicationMonitoringFallback
      isClickHouseConfigured={isClickHouseConfigured}
      hasError={isDefined(error)}
    />
  );
};
