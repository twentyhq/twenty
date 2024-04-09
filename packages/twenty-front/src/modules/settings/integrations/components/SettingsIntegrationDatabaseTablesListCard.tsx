import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { Toggle } from '@/ui/input/components/Toggle';
import { RemoteTable, RemoteTableStatus } from '~/generated-metadata/graphql';

export const settingsIntegrationsDatabaseTablesSchema = z.object({
  syncedTablesByName: z.record(z.boolean()),
});

export type SettingsIntegrationsDatabaseTablesFormValues = z.infer<
  typeof settingsIntegrationsDatabaseTablesSchema
>;

type SettingsIntegrationDatabaseTablesListCardProps = {
  tables: RemoteTable[];
};

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsIntegrationDatabaseTablesListCard = ({
  tables,
}: SettingsIntegrationDatabaseTablesListCardProps) => {
  const { control } =
    useFormContext<SettingsIntegrationsDatabaseTablesFormValues>();

  return (
    <SettingsListCard
      items={tables.map((table) => ({ id: table.name, ...table }))}
      RowRightComponent={({ item: table }) => (
        <StyledRowRightContainer>
          <Controller
            name={`syncedTablesByName.${table.name}`}
            control={control}
            defaultValue={table.status === RemoteTableStatus.Synced}
            render={({ field: { onChange, value } }) => (
              <Toggle value={value} onChange={onChange} />
            )}
          />
        </StyledRowRightContainer>
      )}
      getItemLabel={(table) => table.name}
    />
  );
};
