import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { RecordIndexBoardContainer } from '@/object-record/record-index/components/RecordIndexBoardContainer';
import { RecordIndexBoardDataLoader } from '@/object-record/record-index/components/RecordIndexBoardDataLoader';
import { RecordIndexBoardDataLoaderEffect } from '@/object-record/record-index/components/RecordIndexBoardDataLoaderEffect';
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

import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';

import { RecordIndexActionMenu } from '@/action-menu/components/RecordIndexActionMenu';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewField } from '@/views/types/ViewField';
import { ViewGroup } from '@/views/types/ViewGroup';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewGroupsToRecordGroupDefinitions } from '@/views/utils/mapViewGroupsToRecordGroupDefinitions';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useContext } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  overflow: hidden;
`;

const StyledContainerWithPadding = styled.div`
  height: calc(100% - 40px);
  width: 100%;
`;

export const RecordIndexContainer = () => {
  const [recordIndexViewType, setRecordIndexViewType] = useRecoilState(
    recordIndexViewTypeState,
  );

  const {
    objectNamePlural,
    recordIndexId,
    objectMetadataItem,
    objectNameSingular,
  } = useContext(RecordIndexRootPropsContext);

  const recordGroupDefinitionsCallbackState = useRecoilComponentCallbackStateV2(
    recordGroupDefinitionsComponentState,
  );

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

  const { setColumns } = useRecordBoard(recordIndexId);

  const onViewFieldsChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewFields: ViewField[]) => {
        const newFieldDefinitions = mapViewFieldsToColumnDefinitions({
          viewFields,
          columnDefinitions,
        });

        setTableColumns(newFieldDefinitions);

        const existingRecordIndexFieldDefinitions = snapshot
          .getLoadable(recordIndexFieldDefinitionsState)
          .getValue();

        if (
          !isDeeplyEqual(
            existingRecordIndexFieldDefinitions,
            newFieldDefinitions,
          )
        ) {
          set(recordIndexFieldDefinitionsState, newFieldDefinitions);
        }
      },
    [columnDefinitions, setTableColumns],
  );

  const onViewGroupsChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewGroups: ViewGroup[]) => {
        const newGroupDefinitions = mapViewGroupsToRecordGroupDefinitions({
          objectMetadataItem,
          viewGroups,
        });

        setColumns(newGroupDefinitions);

        const existingRecordIndexGroupDefinitions = snapshot
          .getLoadable(recordGroupDefinitionsCallbackState)
          .getValue();

        if (
          !isDeeplyEqual(
            existingRecordIndexGroupDefinitions,
            newGroupDefinitions,
          )
        ) {
          set(recordGroupDefinitionsCallbackState, newGroupDefinitions);
        }
      },
    [objectMetadataItem, recordGroupDefinitionsCallbackState, setColumns],
  );

  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  return (
    <StyledContainer>
      <InformationBannerWrapper />
      <RecordFieldValueSelectorContextProvider>
        <SpreadsheetImportProvider>
          <ViewBar
            viewBarId={recordIndexId}
            optionsDropdownButton={
              <RecordIndexOptionsDropdown
                recordIndexId={recordIndexId}
                objectMetadataItem={objectMetadataItem}
                viewType={recordIndexViewType ?? ViewType.Table}
              />
            }
            onCurrentViewChange={(view) => {
              if (!view) {
                return;
              }

              onViewFieldsChange(view.viewFields);
              onViewGroupsChange(view.viewGroups);
              setTableFilters(
                mapViewFiltersToFilters(view.viewFilters, filterDefinitions),
              );
              setRecordIndexFilters(
                mapViewFiltersToFilters(view.viewFilters, filterDefinitions),
              );
              setContextStoreTargetedRecordsRule((prev) => ({
                ...prev,
                filters: mapViewFiltersToFilters(
                  view.viewFilters,
                  filterDefinitions,
                ),
              }));
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
        </SpreadsheetImportProvider>
        {recordIndexViewType === ViewType.Table && (
          <>
            <RecordIndexTableContainer
              recordTableId={recordIndexId}
              viewBarId={recordIndexId}
            />
            <RecordIndexTableContainerEffect />
          </>
        )}
        {recordIndexViewType === ViewType.Kanban && (
          <StyledContainerWithPadding>
            <RecordIndexBoardContainer
              recordBoardId={recordIndexId}
              viewBarId={recordIndexId}
              objectNameSingular={objectNameSingular}
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
        <RecordIndexActionMenu actionMenuId={recordIndexId} />
      </RecordFieldValueSelectorContextProvider>
    </StyledContainer>
  );
};
