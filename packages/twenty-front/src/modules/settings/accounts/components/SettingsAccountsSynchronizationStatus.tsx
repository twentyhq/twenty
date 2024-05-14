import { useGetSyncStatusOptions } from '@/settings/accounts/hooks//useGetSyncStatusOptions';
import { Status } from '@/ui/display/status/components/Status';

export type SettingsAccountsSynchronizationStatusProps = {
  syncStatus: string;
  isSyncEnabled?: boolean;
};

export const SettingsAccountsSynchronizationStatus = ({
  syncStatus,
  isSyncEnabled,
}: SettingsAccountsSynchronizationStatusProps) => {
  const syncStatusOptions = useGetSyncStatusOptions();

  const syncStatusOption = syncStatusOptions?.find(
    (option) => option.value === syncStatus,
  );

  if (!isSyncEnabled) {
    return <Status color="gray" text="Not synced" weight="medium" />;
  }

  return (
    <Status
      color={syncStatusOption?.color ?? 'gray'}
      isLoaderVisible={syncStatus === 'ONGOING' || syncStatus === 'PENDING'}
      text={syncStatusOption?.label ?? 'Not synced'}
      weight="medium"
    />
  );
};
