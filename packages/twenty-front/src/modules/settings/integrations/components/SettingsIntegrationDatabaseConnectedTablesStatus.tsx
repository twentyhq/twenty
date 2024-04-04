import { Status } from '@/ui/display/status/components/Status';

type SettingsIntegrationDatabaseConnectedTablesStatusProps = {
  connectedTablesCount: number;
};

export const SettingsIntegrationDatabaseConnectedTablesStatus = ({
  connectedTablesCount,
}: SettingsIntegrationDatabaseConnectedTablesStatusProps) => (
  <Status
    color="green"
    text={
      connectedTablesCount === 1
        ? `1 tracked table`
        : `${connectedTablesCount} tracked tables`
    }
  />
);
