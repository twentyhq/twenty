import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { RecordTableScope } from '@/ui/object/record-table/scopes/RecordTableScope';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useView } from '@/views/hooks/useView';
import { ViewScope } from '@/views/scopes/ViewScope';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

import { useUpdateOneObjectRecord } from '../hooks/useUpdateOneObjectRecord';

import { RecordTableEffect } from './RecordTableEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const RecordTableContainer = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const { columnDefinitions, foundObjectMetadataItem } =
    useFindOneObjectMetadataItem({
      objectNamePlural,
    });

  const { updateOneObject } = useUpdateOneObjectRecord({
    objectNameSingular: foundObjectMetadataItem?.nameSingular,
  });

  const tableScopeId = objectNamePlural ?? '';
  const viewScopeId = objectNamePlural ?? '';

  const { persistViewFields } = useViewFields(viewScopeId);

  const { setTableFilters, setTableSorts, setTableColumns } = useRecordTable({
    recordTableScopeId: tableScopeId,
  });

  const { setEntityCountInCurrentView } = useView({ viewScopeId });

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
        <RecordTableScope
          recordTableScopeId={tableScopeId}
          onColumnsChange={useRecoilCallback(() => (columns) => {
            persistViewFields(mapColumnDefinitionsToViewFields(columns));
          })}
          onEntityCountChange={(entityCount) => {
            setEntityCountInCurrentView(entityCount);
          }}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <RecordTableEffect />
          <RecordTable updateEntityMutation={updateEntity} />
        </RecordTableScope>
      </StyledContainer>
    </ViewScope>
  );
};
