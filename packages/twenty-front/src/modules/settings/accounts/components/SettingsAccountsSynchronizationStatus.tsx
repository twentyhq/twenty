import { useGetSyncStatusOptions } from '@/settings/accounts/hooks//useGetSyncStatusOptions';
import { Status } from '@/ui/display/status/components/Status';

export type SettingsAccountsSynchronizationStatusProps = {
  syncStatus: string;
};

export const SettingsAccountsSynchronizationStatus = ({
  syncStatus,
}: SettingsAccountsSynchronizationStatusProps) => {
  const syncStatusOptions = useGetSyncStatusOptions();

  const syncStatusOption = syncStatusOptions?.find(
    (option) => option.value === syncStatus,
  );

  return (
    <Status
      color={syncStatusOption?.color ?? 'gray'}
      isLoaderVisible={syncStatus === 'ONGOING'}
      text={syncStatusOption?.label ?? 'Not synced'}
      weight="medium"
    />
  );
};
