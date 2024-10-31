import { useGetDatabaseConnectionTables } from '@/databases/hooks/useGetDatabaseConnectionTables';
import { Status } from 'twenty-ui';
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
    return <Status color="red" text="Connection failed" />;
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
          ? `1 tracked table${
              updatesAvailable ? ' (with pending schema updates)' : ''
            }`
          : `${syncedTables.length} tracked tables${
              updatesAvailable ? ' (with pending schema updates)' : ''
            }`
      }
    />
  );
};
