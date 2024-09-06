import { useGetDatabaseConnectionTables } from '@/databases/hooks/useGetDatabaseConnectionTables';
import { Status } from '@/ui/display/status/components/Status';
import { RemoteTableStatus } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

type SettingsIntegrationDatabaseConnectionSyncStatusProps = {
  connectionId: string;
  skip?: boolean;
  shouldFetchPendingSchemaUpdates?: boolean;
};

export const SettingsIntegrationDatabaseConnectionSyncStatus = ({
  connectionId,
  skip,
  shouldFetchPendingSchemaUpdates,
}: SettingsIntegrationDatabaseConnectionSyncStatusProps) => {
  const { tables, error } = useGetDatabaseConnectionTables({
    connectionId,
    skip,
    shouldFetchPendingSchemaUpdates,
  });

  if (isDefined(error)) {
    return <Status color="red" text="Falha na conexão" />;
  }

  const syncedTables = tables.filter(
    (table) => table.status === RemoteTableStatus.Synced,
  );

  const updatesAvailable = tables.some(
    (table) =>
      table.schemaPendingUpdates?.length &&
      table.schemaPendingUpdates.length > 0,
  );

  return (
    <Status
      color={updatesAvailable ? 'yellow' : 'green'}
      text={
        syncedTables.length === 1
          ? `1 tabela rastreada${
              updatesAvailable ? ' (com atualizações de esquema pendentes)' : ''
            }`
          : `${syncedTables.length} tabelas rastreadas${
              updatesAvailable ? ' (com atualizações de esquema pendentes)' : ''
            }`
      }
    />
  );
};
