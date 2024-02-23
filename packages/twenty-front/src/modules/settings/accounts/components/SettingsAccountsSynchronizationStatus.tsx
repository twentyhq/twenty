import { Status } from '@/ui/display/status/components/Status';

type SettingsAccountsSynchronizationStatusProps = {
  synced: boolean;
};

export const SettingsAccountsSynchronizationStatus = ({
  synced,
}: SettingsAccountsSynchronizationStatusProps) => (
  <Status
    color={synced ? 'green' : 'gray'}
    text={synced ? 'Synced' : 'Not Synced'}
    weight="medium"
  />
);
