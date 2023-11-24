import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';

import { useComputeDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useComputeDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableMockModeEffect } from '@/object-record/components/RecordTableMockModeEffect';
import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { RecordTableScope } from '@/ui/object/record-table/scopes/RecordTableScope';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { ViewScope } from '@/views/scopes/ViewScope';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const RecordTableContainerMockMode = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNamePlural,
    },
  );
  const { columnDefinitions } = useComputeDefinitionsFromFieldMetadata(
    foundObjectMetadataItem,
  );

  const tableScopeId = objectNamePlural ?? '';
  const viewScopeId = objectNamePlural ?? '';

  const { persistViewFields } = useViewFields(viewScopeId);

  const { setTableFilters, setTableSorts, setTableColumns } = useRecordTable({
    recordTableScopeId: tableScopeId,
  });

  const updateEntity = () => {};

  return (
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={() => {}}
      onViewFiltersChange={(viewFilters) => {
        setTableFilters(mapViewFiltersToFilters(viewFilters));
      }}
      onViewSortsChange={(viewSorts) => {
        setTableSorts(mapViewSortsToSorts(viewSorts));
      }}
    >
      <StyledContainer>
        <RecordTableScope
          recordTableScopeId={tableScopeId}
          onColumnsChange={useRecoilCallback(() => (columns) => {
            persistViewFields(mapColumnDefinitionsToViewFields(columns));
          })}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <RecordTableMockModeEffect />
          <RecordTable updateEntityMutation={updateEntity} />
        </RecordTableScope>
      </StyledContainer>
    </ViewScope>
  );
};
