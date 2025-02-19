import { SettingsAdminHealthAccountSyncCountersTable } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthAccountSyncCountersTable';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { useContext } from 'react';

export const AccountSyncMetrics = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);
  const details = indicatorHealth.details;
  if (!details) {
    return null;
  }

  const parsedDetails = JSON.parse(details);

  const syncMetrics = [
    {
      details: parsedDetails.messageSync?.details,
      title: 'Message Sync Status',
    },
    {
      details: parsedDetails.calendarSync?.details,
      title: 'Calendar Sync Status',
    },
  ];

  return (
    <>
      {syncMetrics.map((metric) => (
        <SettingsAdminHealthAccountSyncCountersTable
          key={metric.title}
          details={metric.details}
          title={metric.title}
        />
      ))}
    </>
  );
};
