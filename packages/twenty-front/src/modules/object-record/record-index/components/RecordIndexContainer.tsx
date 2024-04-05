import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { RecordIndexBoardContainer } from '@/object-record/record-index/components/RecordIndexBoardContainer';
import { RecordIndexBoardContainerEffect } from '@/object-record/record-index/components/RecordIndexBoardContainerEffect';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { RecordIndexOptionsDropdown } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdown';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewField } from '@/views/types/ViewField';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
  const [recordIndexViewType, setRecordIndexViewType] = useRecoilState(
    recordIndexViewTypeState,
  );
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const setRecordIndexFilters = useSetRecoilState(recordIndexFiltersState);
  const setRecordIndexSorts = useSetRecoilState(recordIndexSortsState);
  const setRecordIndexIsCompactModeActive = useSetRecoilState(
    recordIndexIsCompactModeActiveState,
  );
  const setRecordIndexViewKanbanFieldMetadataIdState = useSetRecoilState(
    recordIndexKanbanFieldMetadataIdState,
  );

  const { setTableFilters, setTableSorts, setTableColumns } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const onViewFieldsChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewFields: ViewField[]) => {
        const newFieldDefinitions = mapViewFieldsToColumnDefinitions({
          viewFields,
          columnDefinitions,
        });

        setTableColumns(newFieldDefinitions);

        const newRecordIndexFieldDefinitions = newFieldDefinitions.filter(
          (boardField) => !boardField.isLabelIdentifier,
        );

        const existingRecordIndexFieldDefinitions = snapshot
          .getLoadable(recordIndexFieldDefinitionsState)
          .getValue();

        if (
          !isDeeplyEqual(
            existingRecordIndexFieldDefinitions,
            newRecordIndexFieldDefinitions,
          )
        ) {
          set(recordIndexFieldDefinitionsState, newRecordIndexFieldDefinitions);
        }
      },
    [columnDefinitions, setTableColumns],
  );

  return (
    <StyledContainer>
      <SpreadsheetImportProvider>
        <ViewBar
          viewBarId={recordIndexId}
          optionsDropdownButton={
            <RecordIndexOptionsDropdown
              recordIndexId={recordIndexId}
              objectNameSingular={objectNameSingular}
              viewType={recordIndexViewType ?? ViewType.Table}
            />
          }
          onCurrentViewChange={(view) => {
            if (!view) {
              return;
            }

            onViewFieldsChange(view.viewFields);
            setTableFilters(
              mapViewFiltersToFilters(view.viewFilters, filterDefinitions),
            );
            setRecordIndexFilters(
              mapViewFiltersToFilters(view.viewFilters, filterDefinitions),
            );
            setTableSorts(mapViewSortsToSorts(view.viewSorts, sortDefinitions));
            setRecordIndexSorts(
              mapViewSortsToSorts(view.viewSorts, sortDefinitions),
            );
            setRecordIndexViewType(view.type);
            setRecordIndexViewKanbanFieldMetadataIdState(
              view.kanbanFieldMetadataId,
            );
            setRecordIndexIsCompactModeActive(view.isCompact);
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
            objectNameSingular={objectNameSingular}
            createRecord={createRecord}
          />
          <RecordIndexTableContainerEffect
            objectNameSingular={objectNameSingular}
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
            objectNameSingular={objectNameSingular}
            createRecord={createRecord}
          />
          <RecordIndexBoardContainerEffect
            objectNameSingular={objectNameSingular}
            recordBoardId={recordIndexId}
            viewBarId={recordIndexId}
          />
        </>
      )}
    </StyledContainer>
  );
};
