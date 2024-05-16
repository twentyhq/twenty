import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { z } from 'zod';

import { useSyncRemoteTable } from '@/databases/hooks/useSyncRemoteTable';
import { useUnsyncRemoteTable } from '@/databases/hooks/useUnsyncRemoteTable';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsIntegrationRemoteTableSyncStatusToggle } from '@/settings/integrations/components/SettingsIntegrationRemoteTableSyncStatusToggle';
import {
  RemoteTable,
  RemoteTableStatus,
  TableUpdate,
} from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

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

const StyledText = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
`;

const getTableUpdatesText = (schemaPendingUpdates: TableUpdate[]) => {
  if (schemaPendingUpdates.includes(TableUpdate.TableDeleted)) {
    return 'Table has been deleted';
  }
  if (
    schemaPendingUpdates.includes(TableUpdate.ColumnsAdded) &&
    schemaPendingUpdates.includes(TableUpdate.ColumnsDeleted)
  ) {
    return 'Columns have been added and other deleted';
  }
  if (schemaPendingUpdates.includes(TableUpdate.ColumnsAdded)) {
    return 'Columns have been added';
  }
  if (schemaPendingUpdates.includes(TableUpdate.ColumnsDeleted)) {
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

  // We need to use a state because the table status update re-render the whole list of toggles
  const [items] = useState(
    tables.map((table) => ({
      ...table,
      id: table.name,
      updatesText: table.schemaPendingUpdates
        ? getTableUpdatesText(table.schemaPendingUpdates)
        : null,
    })),
  );

  const onSyncUpdate = useCallback(
    async (isSynced: boolean, tableName: string) => {
      const table = items.find((table) => table.name === tableName);

      if (!isDefined(table)) return;

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
    [items, syncRemoteTable, connectionId, unsyncRemoteTable],
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
        {item.updatesText && <StyledText>{item.updatesText}</StyledText>}
        <SettingsIntegrationRemoteTableSyncStatusToggle
          table={item}
          onSyncUpdate={onSyncUpdate}
        />
      </StyledRowRightContainer>
    ),
    [onSyncUpdate],
  );
  return (
    <SettingsListCard
      items={items}
      RowRightComponent={rowRightComponent}
      getItemLabel={(table) => table.id}
    />
  );
};
