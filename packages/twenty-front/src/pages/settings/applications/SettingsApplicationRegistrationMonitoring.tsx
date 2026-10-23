import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { doNotTranslate } from 'twenty-shared/i18n';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { ApplicationMonitoring } from '@/settings/application-monitoring/components/ApplicationMonitoring';
import { buildApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/utils/buildApplicationMonitoringPeriodRange';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
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
      skip: !isApplicationMonitoringEnabled || !applicationRegistrationId,
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
      skip:
        !isApplicationMonitoringEnabled ||
        !isClickHouseConfigured ||
        !applicationRegistrationId,
    },
  );

  const registration = registrationData?.findOneApplicationRegistration;
  const isRefreshOfSameApplication =
    refreshedApplicationRegistrationId === applicationRegistrationId;
  const monitoring = (
    data ?? (isRefreshOfSameApplication ? previousData : undefined)
  )?.findApplicationRegistrationMonitoring;
  const clickHouseUrlVariableName = doNotTranslate('CLICKHOUSE_URL');

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

  if (!isApplicationMonitoringEnabled) {
    return null;
  }

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
