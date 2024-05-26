import { useCallback } from 'react';
import styled from '@emotion/styled';
import { z } from 'zod';

import { useSyncRemoteTable } from '@/databases/hooks/useSyncRemoteTable';
import { useSyncRemoteTableSchemaChanges } from '@/databases/hooks/useSyncRemoteTableSchemaChanges';
import { useUnsyncRemoteTable } from '@/databases/hooks/useUnsyncRemoteTable';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsIntegrationRemoteTableSchemaUpdate } from '@/settings/integrations/components/SettingsIntegrationRemoteTableSchemaUpdate';
import { SettingsIntegrationRemoteTableSyncStatusToggle } from '@/settings/integrations/components/SettingsIntegrationRemoteTableSyncStatusToggle';
import {
  DistantTableUpdate,
  RemoteTable,
  RemoteTableStatus,
} from '~/generated-metadata/graphql';

export const settingsIntegrationsDatabaseTablesSchema = z.object({
  syncedTablesByName: z.record(z.boolean()),
});

export type SettingsIntegrationsDatabaseTablesFormValues = z.infer<
  typeof settingsIntegrationsDatabaseTablesSchema
>;

type SettingsIntegrationDatabaseTablesListCardProps = {
  connectionId: string;
  tables: RemoteTable[];
};

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const getDistantTableUpdatesText = (
  schemaPendingUpdates: DistantTableUpdate[],
) => {
  if (schemaPendingUpdates.includes(DistantTableUpdate.TableDeleted)) {
    return 'Table has been deleted';
  }
  if (
    schemaPendingUpdates.includes(DistantTableUpdate.ColumnsAdded) &&
    schemaPendingUpdates.includes(DistantTableUpdate.ColumnsDeleted)
  ) {
    return 'Columns have been added and other deleted';
  }
  if (schemaPendingUpdates.includes(DistantTableUpdate.ColumnsAdded)) {
    return 'Columns have been added';
  }
  if (schemaPendingUpdates.includes(DistantTableUpdate.ColumnsDeleted)) {
    return 'Columns have been deleted';
  }
  return null;
};

export const SettingsIntegrationDatabaseTablesListCard = ({
  connectionId,
  tables,
}: SettingsIntegrationDatabaseTablesListCardProps) => {
  const { syncRemoteTable } = useSyncRemoteTable();
  const { unsyncRemoteTable } = useUnsyncRemoteTable();
  const { syncRemoteTableSchemaChanges } = useSyncRemoteTableSchemaChanges();

  const items = tables.map((table) => ({
    ...table,
    id: table.name,
    updatesText: table.schemaPendingUpdates
      ? getDistantTableUpdatesText(table.schemaPendingUpdates)
      : null,
  }));

  const onSyncUpdate = useCallback(
    async (isSynced: boolean, tableName: string) => {
      if (isSynced) {
        await syncRemoteTable({
          remoteServerId: connectionId,
          name: tableName,
        });
      } else {
        await unsyncRemoteTable({
          remoteServerId: connectionId,
          name: tableName,
        });
      }
    },
    [syncRemoteTable, connectionId, unsyncRemoteTable],
  );

  const onSyncSchemaUpdate = useCallback(
    async (tableName: string) =>
      syncRemoteTableSchemaChanges({
        remoteServerId: connectionId,
        name: tableName,
      }),
    [syncRemoteTableSchemaChanges, connectionId],
  );

  const rowRightComponent = useCallback(
    ({
      item,
    }: {
      item: {
        id: string;
        name: string;
        status: RemoteTableStatus;
        updatesText?: string | null;
      };
    }) => (
      <StyledRowRightContainer>
        {item.updatesText && (
          <SettingsIntegrationRemoteTableSchemaUpdate
            updatesText={item.updatesText}
            onUpdate={() => onSyncSchemaUpdate(item.name)}
          />
        )}
        <SettingsIntegrationRemoteTableSyncStatusToggle
          tableName={item.name}
          tableStatus={item.status}
          onSyncUpdate={onSyncUpdate}
        />
      </StyledRowRightContainer>
    ),
    [onSyncSchemaUpdate, onSyncUpdate],
  );
  return (
    <SettingsListCard
      items={items}
      RowRightComponent={rowRightComponent}
      getItemLabel={(table) => table.id}
    />
  );
};
