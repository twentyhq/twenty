import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';

import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { TableOptionsDropdown } from '@/ui/data/data-table/options/components/TableOptionsDropdown';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useView } from '@/views/hooks/useView';
import { ViewScope } from '@/views/scopes/ViewScope';

import { useUpdateOneObject } from '../hooks/useUpdateOneObject';
import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

import { ObjectDataTableEffect } from './ObjectDataTableEffect';
import { ObjectTableEffect } from './ObjectTableEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export type ObjectTableProps = Pick<
  MetadataObjectIdentifier,
  'objectNamePlural'
>;

export const ObjectTable = ({ objectNamePlural }: ObjectTableProps) => {
  const { updateOneObject } = useUpdateOneObject({
    objectNamePlural,
  });

  const viewScopeId = objectNamePlural ?? '';

  const { persistViewFields } = useViewFields(viewScopeId);
  const { setCurrentViewFields } = useView({ viewScopeId: viewScopeId });

  const updateEntity = ({
    variables,
  }: {
    variables: {
      where: { id: string };
      data: {
        [fieldName: string]: any;
      };
    };
  }) => {
    updateOneObject?.({
      idToUpdate: variables.where.id,
      input: variables.data,
    });
  };

  const updateTableColumns = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewFields: ColumnDefinition<FieldMetadata>[]) => {
        set(tableColumnsScopedState(viewScopeId), viewFields);
      },
  );

  return (
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={(viewFields) => {
        // updateTableColumns(viewFields);
      }}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: (columns) => {
              // setCurrentViewFields?.(columns);
              // persistViewFields(columns);
            },
          }}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown />}
            optionsDropdownScopeId="table-dropdown-option"
          />
          <ObjectTableEffect />
          <ObjectDataTableEffect objectNamePlural={objectNamePlural} />
          <DataTable updateEntityMutation={updateEntity} />
        </TableContext.Provider>
      </StyledContainer>
    </ViewScope>
  );
};
