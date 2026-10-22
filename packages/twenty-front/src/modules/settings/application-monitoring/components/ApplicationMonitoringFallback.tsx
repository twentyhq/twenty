import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { Section } from 'twenty-ui/components/layout';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';

type ApplicationMonitoringFallbackProps = {
  isClickHouseConfigured: boolean;
  hasError: boolean;
  actions?: ReactNode;
};

export const ApplicationMonitoringFallback = ({
  isClickHouseConfigured,
  hasError,
  actions,
}: ApplicationMonitoringFallbackProps) => {
  const { t } = useLingui();
  const clickHouseUrlVariableName = doNotTranslate('CLICKHOUSE_URL');

  if (!isClickHouseConfigured) {
    return (
      <Section.Root>
        <Section.Header title={t`Health`} />
        <SettingsEmptyPlaceholder>{t`Monitoring needs ClickHouse. Set ${clickHouseUrlVariableName} on the server to collect app logs and metrics.`}</SettingsEmptyPlaceholder>
      </Section.Root>
    );
  }

  if (hasError) {
    return (
      <Section.Root>
        <Section.Header title={t`Health`} actions={actions} />
        <SettingsEmptyPlaceholder>{t`Couldn't load monitoring`}</SettingsEmptyPlaceholder>
      </Section.Root>
    );
  }

  return <SettingsSectionSkeletonLoader />;
};
