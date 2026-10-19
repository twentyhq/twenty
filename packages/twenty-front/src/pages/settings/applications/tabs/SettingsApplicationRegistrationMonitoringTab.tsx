import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { ApplicationMonitoring } from '@/settings/application-monitoring/components/ApplicationMonitoring';
import { buildApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/utils/buildApplicationMonitoringPeriodRange';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type ApplicationRegistration,
  FindApplicationRegistrationMonitoringDocument,
} from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationGeneralStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralStats';

export const SettingsApplicationRegistrationMonitoringTab = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const [periodRange, setPeriodRange] = useState(() =>
    buildApplicationMonitoringPeriodRange('7d'),
  );

  const { data, loading, error } = useQuery(
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
  const clickHouseUrlVariableName = doNotTranslate('CLICKHOUSE_URL');

  const renderMonitoring = () => {
    if (!isClickHouseConfigured) {
      return (
        <Section.Root>
          <Section.Header title={t`Health`} />
          <SettingsEmptyPlaceholder>{t`Monitoring needs ClickHouse. Set ${clickHouseUrlVariableName} on the server to collect app logs and metrics.`}</SettingsEmptyPlaceholder>
        </Section.Root>
      );
    }

    if (isDefined(error)) {
      return (
        <Section.Root>
          <Section.Header title={t`Health`} />
          <SettingsEmptyPlaceholder>{t`Couldn't load monitoring`}</SettingsEmptyPlaceholder>
        </Section.Root>
      );
    }

    if (!isDefined(monitoring)) {
      return loading ? <SettingsSectionSkeletonLoader /> : null;
    }

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
  };

  return (
    <>
      {renderMonitoring()}
      <SettingsApplicationRegistrationGeneralStats
        registration={registration}
      />
    </>
  );
};
