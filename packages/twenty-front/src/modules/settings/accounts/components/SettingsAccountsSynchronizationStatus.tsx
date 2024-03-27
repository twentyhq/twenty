import { Status } from 'twenty-ui';

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
