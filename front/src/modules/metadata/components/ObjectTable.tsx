import styled from '@emotion/styled';

import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { TableOptionsDropdown } from '@/ui/data/data-table/options/components/TableOptionsDropdown';
import { ViewBar } from '@/views/components/ViewBar';
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

  return (
    <ViewScope viewScopeId={viewScopeId} onViewFieldsChange={() => {}}>
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: () => {},
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
