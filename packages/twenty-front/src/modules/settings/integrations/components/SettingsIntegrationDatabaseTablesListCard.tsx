import { useCallback } from 'react';
import styled from '@emotion/styled';
import { z } from 'zod';

import { useSyncRemoteTable } from '@/databases/hooks/useSyncRemoteTable';
import { useUnsyncRemoteTable } from '@/databases/hooks/useUnsyncRemoteTable';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { Toggle } from '@/ui/input/components/Toggle';
import { RemoteTable } from '~/generated-metadata/graphql';

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

  const onSyncUpdate = useCallback(
    async (value: boolean, tableName: string) => {
      const table = tables.filter((table) => table.name === tableName)[0];

      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (!table) return;

      if (value && table.status !== 'SYNCED') {
        await syncRemoteTable({
          remoteServerId: connectionId,
          name: tableName,
          schema: table.schema,
        });
      } else if (!value && table.status !== 'NOT_SYNCED') {
        await unsyncRemoteTable({
          remoteServerId: connectionId,
          name: tableName,
          schema: table.schema,
        });
      }
    },
    [connectionId, syncRemoteTable, tables, unsyncRemoteTable],
  );

  return (
    <SettingsListCard
      items={tables.map((table) => ({ id: table.name, ...table }))}
      RowRightComponent={({ item: table }) => (
        <StyledRowRightContainer>
          <Toggle
            value={table.status === 'SYNCED'}
            onChange={(value) => onSyncUpdate(value, table.name)}
          />
        </StyledRowRightContainer>
      )}
      getItemLabel={(table) => table.name}
    />
  );
};
