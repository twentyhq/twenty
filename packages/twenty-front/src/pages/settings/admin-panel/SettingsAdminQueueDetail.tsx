import { SettingsAdminQueueJobsTable } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueJobsTable';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsAdminQueueDetail = () => {
  const { queueName } = useParams<{ queueName: string }>();
  const [retentionConfig, setRetentionConfig] = useState<{
    completedMaxAge: number;
    completedMaxCount: number;
    failedMaxAge: number;
    failedMaxCount: number;
  } | null>(null);

  if (!queueName) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);

    if (days >= 1) {
      return plural(days, {
        one: `${days} day`,
        other: `${days} days`,
      });
    }

    return plural(hours, {
      one: `${hours} hour`,
      other: `${hours} hours`,
    });
  };

  const completedDuration = retentionConfig
    ? formatDuration(retentionConfig.completedMaxAge)
    : '';
  const failedDuration = retentionConfig
    ? formatDuration(retentionConfig.failedMaxAge)
    : '';
  const maxCount = retentionConfig ? retentionConfig.completedMaxCount : 0;

  const queueDescription = retentionConfig
    ? t`Completed jobs kept for ${completedDuration}, failed jobs kept for ${failedDuration} (max ${maxCount} each)`
    : t`Loading retention configuration...`;

  return (
    <SubMenuTopBarContainer
      title={t`Queue: ${queueName}`}
      links={[
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Health Status`,
          href: getSettingsPath(SettingsPath.AdminPanelHealthStatus),
        },
        {
          children: t`Worker`,
          href: getSettingsPath(SettingsPath.AdminPanelIndicatorHealthStatus, {
            indicatorId: 'worker',
          }),
        },
        {
          children: queueName,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Jobs`} description={queueDescription} />
          <SettingsAdminQueueJobsTable
            queueName={queueName}
            onRetentionConfigLoaded={setRetentionConfig}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
