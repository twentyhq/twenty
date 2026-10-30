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
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  FindApplicationRegistrationMonitoringDocument,
  FindOneApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';

export const SettingsApplicationRegistrationMonitoring = () => {
  const { t } = useLingui();
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const [periodRange, setPeriodRange] = useState(() =>
    buildApplicationMonitoringPeriodRange({ period: '7d' }),
  );
  const [
    refreshedApplicationRegistrationId,
    setRefreshedApplicationRegistrationId,
  ] = useState<string | null>(null);

  const { data: registrationData, loading: isRegistrationLoading } = useQuery(
    FindOneApplicationRegistrationDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const { data, previousData, loading, error } = useQuery(
    FindApplicationRegistrationMonitoringDocument,
    {
      variables: {
        id: applicationRegistrationId,
        periodStart: periodRange.periodStart,
        periodEnd: periodRange.periodEnd,
      },
      skip: !isClickHouseConfigured || !applicationRegistrationId,
    },
  );

  const registration = registrationData?.findOneApplicationRegistration;
  const isRefreshOfSameApplication =
    refreshedApplicationRegistrationId === applicationRegistrationId;
  const monitoring = (
    data ?? (isRefreshOfSameApplication ? previousData : undefined)
  )?.findApplicationRegistrationMonitoring;

  const developersLinks = [
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
  ];

  if (!isDefined(registration)) {
    if (isRegistrationLoading) {
      return <SettingsSkeletonLoader />;
    }

    return (
      <SettingsPageLayout
        title={t`Monitoring`}
        links={[...developersLinks, { children: t`Monitoring` }]}
      >
        <SettingsPageContainer>
          <SettingsEmptyPlaceholder>{t`This app could not be found`}</SettingsEmptyPlaceholder>
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
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
        onPeriodChange={(period) => {
          setRefreshedApplicationRegistrationId(null);
          setPeriodRange(buildApplicationMonitoringPeriodRange({ period }));
        }}
        onRefresh={() => {
          setRefreshedApplicationRegistrationId(applicationRegistrationId);
          setPeriodRange(
            buildApplicationMonitoringPeriodRange({
              period: periodRange.period,
            }),
          );
        }}
        isRefreshing={loading}
      />
    );
  };

  return (
    <SettingsPageLayout
      title={t`Monitoring`}
      links={[
        ...developersLinks,
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
