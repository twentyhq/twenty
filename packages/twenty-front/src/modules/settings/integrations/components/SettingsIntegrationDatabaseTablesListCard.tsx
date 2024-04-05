import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { Toggle } from '@/ui/input/components/Toggle';

export const settingsIntegrationsDatabaseTablesSchema = z.object({
  trackedTablesById: z.record(z.boolean()),
});

export type SettingsIntegrationsDatabaseTablesFormValues = z.infer<
  typeof settingsIntegrationsDatabaseTablesSchema
>;

type SettingsIntegrationDatabaseTablesListCardProps = {
  tables: { id: string; name: string; isTracked?: boolean }[];
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
      items={tables}
      RowRightComponent={({ item: table }) => (
        <StyledRowRightContainer>
          <Controller
            name={`trackedTablesById.${table.id}`}
            control={control}
            defaultValue={!!table.isTracked}
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
