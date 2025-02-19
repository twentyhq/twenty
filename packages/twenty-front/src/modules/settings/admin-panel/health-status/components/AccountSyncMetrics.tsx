import { SettingsAdminHealthAccountSyncCountersTables } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthAccountSyncCountersTable';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { useContext } from 'react';

export const AccountSyncMetrics = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);
  const details = indicatorHealth.details;
  if (!details) {
    return null;
  }

  const parsedDetails = JSON.parse(details);
  const { messageSync, calendarSync } = parsedDetails;

  return (
    <>
      <SettingsAdminHealthAccountSyncCountersTables
        details={messageSync?.details}
        title="Message Sync Status"
      />
      <SettingsAdminHealthAccountSyncCountersTables
        details={calendarSync?.details}
        title="Calendar Sync Status"
      />
    </>
  );
};
