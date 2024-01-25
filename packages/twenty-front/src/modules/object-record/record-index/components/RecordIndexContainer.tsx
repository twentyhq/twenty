import { useState } from 'react';
import styled from '@emotion/styled';

import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { RecordIndexBoardContainer } from '@/object-record/record-index/components/RecordIndexBoardContainer';
import { RecordIndexBoardContainerEffect } from '@/object-record/record-index/components/RecordIndexBoardContainerEffect';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { TableOptionsDropdownId } from '@/object-record/record-table/constants/TableOptionsDropdownId';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { TableOptionsDropdown } from '@/object-record/record-table/options/components/TableOptionsDropdown';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
  padding-left: ${({ theme }) => theme.table.horizontalCellPadding};
`;

type RecordIndexContainerProps = {
  recordIndexId: string;
  objectNamePlural: string;
  createRecord: () => Promise<void>;
};

export const RecordIndexContainer = ({
  createRecord,
  recordIndexId,
  objectNamePlural,
}: RecordIndexContainerProps) => {
  const [recordIndexViewType, setRecordIndexViewType] = useState<
    ViewType | undefined
  >(undefined);

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { openPersonSpreadsheetImport } = useSpreadsheetPersonImport();
  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const { setTableFilters, setTableSorts, setTableColumns } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const handleImport = () => {
    const openImport =
      objectNamePlural === 'companies'
        ? openCompanySpreadsheetImport
        : openPersonSpreadsheetImport;
    openImport();
  };

  return (
    <StyledContainer>
      <SpreadsheetImportProvider>
        <ViewBar
          viewBarId={recordIndexId}
          optionsDropdownButton={
            <TableOptionsDropdown
              recordTableId={recordIndexId}
              onImport={
                ['companies', 'people'].includes(recordIndexId)
                  ? handleImport
                  : undefined
              }
            />
          }
          optionsDropdownScopeId={TableOptionsDropdownId}
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
          onViewTypeChange={(viewType: ViewType) => {
            setRecordIndexViewType(viewType);
          }}
        />
        <RecordIndexViewBarEffect
          objectNamePlural={objectNamePlural}
          viewBarId={recordIndexId}
        />
      </SpreadsheetImportProvider>
      {recordIndexViewType === ViewType.Table && (
        <>
          <RecordIndexTableContainer
            recordTableId={recordIndexId}
            viewBarId={recordIndexId}
            objectNamePlural={objectNamePlural}
            createRecord={createRecord}
          />
          <RecordIndexTableContainerEffect
            objectNamePlural={objectNamePlural}
            recordTableId={recordIndexId}
            viewBarId={recordIndexId}
          />
        </>
      )}
      {recordIndexViewType === ViewType.Kanban && (
        <>
          <RecordIndexBoardContainer
            recordBoardId={recordIndexId}
            viewBarId={recordIndexId}
            objectNamePlural={objectNamePlural}
            createRecord={createRecord}
          />
          <RecordIndexBoardContainerEffect
            objectNamePlural={objectNamePlural}
            recordBoardId={recordIndexId}
            viewBarId={recordIndexId}
          />
        </>
      )}
    </StyledContainer>
  );
};
