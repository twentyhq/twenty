import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { ApplicationMonitoring } from '@/settings/application-monitoring/components/ApplicationMonitoring';
import { ApplicationMonitoringFallback } from '@/settings/application-monitoring/components/ApplicationMonitoringFallback';
import { buildApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/utils/buildApplicationMonitoringPeriodRange';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  FindApplicationRegistrationMonitoringDocument,
  FindOneApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';

export const SettingsApplicationRegistrationMonitoring = () => {
  const { t } = useLingui();
  const isApplicationMonitoringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APPLICATION_MONITORING_ENABLED,
  );
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const [periodRange, setPeriodRange] = useState(() =>
    buildApplicationMonitoringPeriodRange('7d'),
  );

  const { data: registrationData } = useQuery(
    FindOneApplicationRegistrationDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !isApplicationMonitoringEnabled || !applicationRegistrationId,
    },
  );

  const { data, error } = useQuery(
    FindApplicationRegistrationMonitoringDocument,
    {
      variables: {
        id: applicationRegistrationId,
        periodStart: periodRange.periodStart,
        periodEnd: periodRange.periodEnd,
      },
      skip:
        !isApplicationMonitoringEnabled ||
        !isClickHouseConfigured ||
        !applicationRegistrationId,
    },
  );

  const registration = registrationData?.findOneApplicationRegistration;
  const monitoring = data?.findApplicationRegistrationMonitoring;

  if (!isApplicationMonitoringEnabled || !isDefined(registration)) {
    return null;
  }

  const renderContent = () => {
    if (!isClickHouseConfigured || isDefined(error) || !isDefined(monitoring)) {
      return (
        <ApplicationMonitoringFallback
          isClickHouseConfigured={isClickHouseConfigured}
          hasError={isDefined(error)}
        />
      );
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
    <SettingsPageLayout
      title={t`Monitoring`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Developers`,
          href: getSettingsPath(
            SettingsPath.Developers,
            undefined,
            undefined,
            SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS,
          ),
        },
        {
          children: registration.name,
          href: getSettingsPath(SettingsPath.ApplicationRegistrationDetail, {
            applicationRegistrationId: registration.id,
          }),
        },
        { children: t`Monitoring` },
      ]}
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
