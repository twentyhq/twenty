import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { TableContext } from '@/ui/object/record-table/contexts/TableContext';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { tableColumnsScopedState } from '@/ui/object/record-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/object/record-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/object/record-table/states/tableSortsScopedState';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { ViewScope } from '@/views/scopes/ViewScope';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

import { useObjectMetadataItemInContext } from '../hooks/useObjectMetadataItemInContext';
import { useUpdateOneObject } from '../hooks/useUpdateOneObject';
import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { ObjectTableEffect } from './ObjectTableEffect';
import { ObjectRecordTableEffect } from './RecordTableEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export type ObjectTableProps = Pick<
  ObjectMetadataItemIdentifier,
  'objectNamePlural'
>;

export const ObjectTable = ({ objectNamePlural }: ObjectTableProps) => {
  const { updateOneObject } = useUpdateOneObject({
    objectNamePlural,
  });
  const { columnDefinitions, foundObjectMetadataItem } =
    useObjectMetadataItemInContext();
  const tableScopeId = foundObjectMetadataItem?.namePlural ?? '';
  const viewScopeId = objectNamePlural ?? '';

  const { persistViewFields } = useViewFields(viewScopeId);

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
          mapViewFieldsToColumnDefinitions(viewFields, columnDefinitions),
        );
      }}
      onViewFiltersChange={(viewFilters) => {
        setTableFilters(mapViewFiltersToFilters(viewFilters));
      }}
      onViewSortsChange={(viewSorts) => {
        setTableSorts(mapViewSortsToSorts(viewSorts));
      }}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: useRecoilCallback(() => (columns) => {
              persistViewFields(mapColumnDefinitionsToViewFields(columns));
            }),
          }}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <ObjectTableEffect />
          <ObjectRecordTableEffect objectNamePlural={objectNamePlural} />
          <RecordTable updateEntityMutation={updateEntity} />
        </TableContext.Provider>
      </StyledContainer>
    </ViewScope>
  );
};
