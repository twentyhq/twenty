import { useGetSyncStatusMetadata } from '@/settings/accounts/hooks/useGetSyncStatusMetadata';
import { Status } from '@/ui/display/status/components/Status';

export type SettingsAccountsSynchronizationStatusProps = {
  syncStatus: string;
};

export const SettingsAccountsSynchronizationStatus = ({
  syncStatus,
}: SettingsAccountsSynchronizationStatusProps) => {
  const syncMetadataOptions = useGetSyncStatusMetadata();

  const syncStatusOption = syncMetadataOptions?.find(
    (option) => option.value === syncStatus,
  );

  return (
    <Status
      color={syncStatusOption?.color ?? 'gray'}
      text={syncStatusOption?.label ?? 'Not synced'}
      weight="medium"
    />
  );
};
