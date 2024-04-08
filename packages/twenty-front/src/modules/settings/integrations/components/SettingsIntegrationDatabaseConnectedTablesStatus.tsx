import { useGetDatabaseConnectionTables } from '@/databases/hooks/useGetDatabaseConnectionTables';
import { Status } from '@/ui/display/status/components/Status';

type SettingsIntegrationDatabaseConnectedTablesStatusProps = {
  connectionId: string;
  skip?: boolean;
};

export const SettingsIntegrationDatabaseConnectedTablesStatus = ({
  connectionId,
  skip,
}: SettingsIntegrationDatabaseConnectedTablesStatusProps) => {
  const { tables } = useGetDatabaseConnectionTables({
    connectionId,
    skip,
  });

  return (
    <Status
      color="green"
      text={
        tables.length === 1
          ? `1 tracked table`
          : `${tables.length} tracked tables`
      }
    />
  );
};
