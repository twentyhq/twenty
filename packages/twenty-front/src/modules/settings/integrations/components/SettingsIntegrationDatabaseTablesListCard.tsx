import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { z } from 'zod';

import { useSyncRemoteTable } from '@/databases/hooks/useSyncRemoteTable';
import { useUnsyncRemoteTable } from '@/databases/hooks/useUnsyncRemoteTable';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsIntegrationSyncStatusToggle } from '@/settings/integrations/components/SettingsIntegrationSyncStatusToggle';
import { RemoteTable, RemoteTableStatus } from '~/generated-metadata/graphql';

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

export const SettingsIntegrationDatabaseTablesListCard = ({
  connectionId,
  tables,
}: SettingsIntegrationDatabaseTablesListCardProps) => {
  const { syncRemoteTable } = useSyncRemoteTable();
  const { unsyncRemoteTable } = useUnsyncRemoteTable();

  const [items] = useState(
    tables.map((table) => ({
      id: table.name,
      ...table,
    })),
  );

  const onSyncUpdate = useCallback(
    async (value: boolean, tableName: string) => {
      const table = items.filter((table) => table.name === tableName)[0];

      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (!table) return;

      if (value) {
        await syncRemoteTable({
          remoteServerId: connectionId,
          name: tableName,
          schema: table.schema,
        });
      } else {
        await unsyncRemoteTable({
          remoteServerId: connectionId,
          name: tableName,
          schema: table.schema,
        });
      }
    },
    [connectionId, syncRemoteTable, items, unsyncRemoteTable],
  );

  const rowRightComponent = useCallback(
    ({
      item,
    }: {
      item: { id: string; name: string; status: RemoteTableStatus };
    }) => (
      <StyledRowRightContainer>
        <SettingsIntegrationSyncStatusToggle
          item={item}
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
