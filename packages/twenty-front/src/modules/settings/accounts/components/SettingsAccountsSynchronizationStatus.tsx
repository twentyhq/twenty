import { Status } from '@/ui/display/status/components/Status';

export type SettingsAccountsSynchronizationStatusProps = {
  syncStatus: 'synced' | 'failed' | 'notSynced';
};

export const SettingsAccountsSynchronizationStatus = ({
  syncStatus,
}: SettingsAccountsSynchronizationStatusProps) => (
  <Status
    color={
      syncStatus === 'synced'
        ? 'green'
        : syncStatus === 'failed'
          ? 'red'
          : 'gray'
    }
    text={
      syncStatus === 'synced'
        ? 'Synced'
        : syncStatus === 'failed'
          ? 'Sync failed'
          : 'Not synced'
    }
    weight="medium"
  />
);
