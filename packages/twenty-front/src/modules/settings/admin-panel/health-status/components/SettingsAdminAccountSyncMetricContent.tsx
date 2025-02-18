import { SettingsAdminHealthAccountSyncCountersTables } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthAccountSyncCountersTable';

export const SettingsAdminAccountSyncMetricContent = ({
  details,
}: {
  details: string | null | undefined;
}) => {
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
