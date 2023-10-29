import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableOptionsDropdownId } from '@/ui/data/data-table/constants/TableOptionsDropdownId';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { TableOptionsDropdown } from '@/ui/data/data-table/options/components/TableOptionsDropdown';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/data/data-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/data/data-table/states/tableSortsScopedState';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useView } from '@/views/hooks/useView';
import { ViewScope } from '@/views/scopes/ViewScope';
import { columnDefinitionsToViewFields } from '@/views/utils/columnDefinitionToViewField';
import { viewFieldsToColumnDefinitions } from '@/views/utils/viewFieldsToColumnDefinitions';
import { viewFiltersToFilters } from '@/views/utils/viewFiltersToFilters';
import { viewSortsToSorts } from '@/views/utils/viewSortsToSorts';

import { useMetadataObjectInContext } from '../hooks/useMetadataObjectInContext';
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
  const { columnDefinitions, foundMetadataObject } =
    useMetadataObjectInContext();
  const tableScopeId = foundMetadataObject?.namePlural ?? '';
  const viewScopeId = objectNamePlural ?? '';

  const { persistViewFields } = useViewFields(viewScopeId);
  const { setCurrentViewFields } = useView({
    viewScopeId,
  });

  const setTableColumns = useSetRecoilState(
    tableColumnsScopedState(tableScopeId),
  );

  const setTableFilters = useSetRecoilState(
    tableFiltersScopedState(tableScopeId),
  );

  const setTableSorts = useSetRecoilState(tableSortsScopedState(tableScopeId));

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
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={(viewFields) => {
        setTableColumns(
          viewFieldsToColumnDefinitions(viewFields, columnDefinitions),
        );
      }}
      onViewFiltersChange={(viewFilters) => {
        setTableFilters(viewFiltersToFilters(viewFilters));
      }}
      onViewSortsChange={(viewSorts) => {
        setTableSorts(viewSortsToSorts(viewSorts));
      }}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: useRecoilCallback(() => (columns) => {
              setCurrentViewFields?.(columnDefinitionsToViewFields(columns));
              persistViewFields(columnDefinitionsToViewFields(columns));
            }),
          }}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <ObjectTableEffect />
          <ObjectDataTableEffect objectNamePlural={objectNamePlural} />
          <DataTable updateEntityMutation={updateEntity} />
        </TableContext.Provider>
      </StyledContainer>
    </ViewScope>
  );
};
