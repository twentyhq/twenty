import styled from '@emotion/styled';
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { RecordIndexBoardContainer } from '@/object-record/record-index/components/RecordIndexBoardContainer';
import { RecordIndexBoardDataLoader } from '@/object-record/record-index/components/RecordIndexBoardDataLoader';
import { RecordIndexBoardDataLoaderEffect } from '@/object-record/record-index/components/RecordIndexBoardDataLoaderEffect';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { RecordIndexEventContext } from '@/object-record/record-index/contexts/RecordIndexEventContext';
import { RecordIndexOptionsDropdown } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdown';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useFindRecordCursorFromFindManyCacheRootQuery } from '@/object-record/record-show/hooks/useFindRecordCursorFromFindManyCacheRootQuery';
import { findView } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { ViewBar } from '@/views/components/ViewBar';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { View } from '@/views/types/View';
import { ViewField } from '@/views/types/ViewField';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useNavigate } from 'react-router-dom';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const StyledContainerWithPadding = styled.div`
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

  const { objectMetadataItem } = useObjectMetadataItem({
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

  const navigate = useNavigate();

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const currentViewId = useRecoilValue(
    currentViewIdComponentState({
      scopeId: recordIndexId,
    }),
  );

  const view = findView({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
    viewId: currentViewId ?? null,
    views,
  });

  const filter = turnObjectDropdownFilterIntoQueryFilter(
    mapViewFiltersToFilters(view?.viewFilters ?? [], filterDefinitions),
    objectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    mapViewSortsToSorts(view?.viewSorts ?? [], sortDefinitions),
  );

  const { findCursorInCache } = useFindRecordCursorFromFindManyCacheRootQuery({
    fieldVariables: {
      filter,
      orderBy,
    },
    objectNamePlural: objectNamePlural,
  });

  const handleIndexIdentifierClick = (recordId: string) => {
    const cursor = findCursorInCache(recordId);

    // TODO: use URL builder
    navigate(
      `/object/${objectNameSingular}/${recordId}?view=${currentViewId}`,
      {
        state: {
          cursor,
        },
      },
    );
  };

  const handleIndexRecordsLoaded = useRecoilCallback(
    ({ set }) =>
      () => {
        // TODO: find a better way to reset this state ?
        set(lastShowPageRecordIdState, null);
      },
    [],
  );

  return (
    <StyledContainer>
      <RecordFieldValueSelectorContextProvider>
        <SpreadsheetImportProvider>
          <StyledContainerWithPadding>
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
                setTableSorts(
                  mapViewSortsToSorts(view.viewSorts, sortDefinitions),
                );
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
          </StyledContainerWithPadding>
        </SpreadsheetImportProvider>
        <RecordIndexEventContext.Provider
          value={{
            onIndexIdentifierClick: handleIndexIdentifierClick,
            onIndexRecordsLoaded: handleIndexRecordsLoaded,
          }}
        >
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
            <StyledContainerWithPadding>
              <RecordIndexBoardContainer
                recordBoardId={recordIndexId}
                viewBarId={recordIndexId}
                objectNameSingular={objectNameSingular}
                createRecord={createRecord}
              />
              <RecordIndexBoardDataLoader
                objectNameSingular={objectNameSingular}
                recordBoardId={recordIndexId}
              />
              <RecordIndexBoardDataLoaderEffect
                objectNameSingular={objectNameSingular}
                recordBoardId={recordIndexId}
              />
            </StyledContainerWithPadding>
          )}
        </RecordIndexEventContext.Provider>
      </RecordFieldValueSelectorContextProvider>
    </StyledContainer>
  );
};
