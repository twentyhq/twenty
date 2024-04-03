import { Status } from '@/ui/display/status/components/Status';

type SettingsIntegrationDatabaseConnectedTablesStatusProps = {
  connectedTablesNb: number;
};

export const SettingsIntegrationDatabaseConnectedTablesStatus = ({
  connectedTablesNb,
}: SettingsIntegrationDatabaseConnectedTablesStatusProps) => (
  <Status
    color="green"
    text={
      connectedTablesNb === 1
        ? `1 tracked table`
        : `${connectedTablesNb} tracked tables`
    }
  />
);
