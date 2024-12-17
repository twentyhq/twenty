import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { ObjectOptionsDropdown } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdown';
import { RecordIndexBoardContainer } from '@/object-record/record-index/components/RecordIndexBoardContainer';
import { RecordIndexBoardDataLoader } from '@/object-record/record-index/components/RecordIndexBoardDataLoader';
import { RecordIndexBoardDataLoaderEffect } from '@/object-record/record-index/components/RecordIndexBoardDataLoaderEffect';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexFiltersState } from '@/object-record/record-index/states/recordIndexFiltersState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';

import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';

import { RecordIndexActionMenu } from '@/action-menu/components/RecordIndexActionMenu';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useSetRecordGroup } from '@/object-record/record-group/hooks/useSetRecordGroup';
import { RecordIndexFiltersToContextStoreEffect } from '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexViewFilterGroupsState } from '@/object-record/record-index/states/recordIndexViewFilterGroupsState';
import { aggregateOperationForViewFieldState } from '@/object-record/record-table/record-table-footer/states/aggregateOperationForViewFieldState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewField } from '@/views/types/ViewField';
import { ViewGroup } from '@/views/types/ViewGroup';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewGroupsToRecordGroupDefinitions } from '@/views/utils/mapViewGroupsToRecordGroupDefinitions';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
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
  margin-left: ${({ theme }) => theme.spacing(2)};
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
  } = useRecordIndexContextOrThrow();

  const setRecordGroup = useSetRecordGroup(recordIndexId);

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const setRecordIndexViewFilterGroups = useSetRecoilState(
    recordIndexViewFilterGroupsState,
  );
  const setRecordIndexFilters = useSetRecoilState(recordIndexFiltersState);
  const setRecordIndexSorts = useSetRecoilState(recordIndexSortsState);
  const setRecordIndexIsCompactModeActive = useSetRecoilState(
    recordIndexIsCompactModeActiveState,
  );
  const setRecordIndexViewKanbanFieldMetadataIdState = useSetRecoilState(
    recordIndexKanbanFieldMetadataIdState,
  );
  const setRecordIndexViewKanbanAggregateOperationState = useSetRecoilState(
    recordIndexKanbanAggregateOperationState,
  );

  const {
    setTableViewFilterGroups,
    setTableFilters,
    setTableSorts,
    setTableColumns,
  } = useRecordTable({
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

        for (const viewField of viewFields) {
          const aggregateOperationForViewField = snapshot
            .getLoadable(
              aggregateOperationForViewFieldState({
                viewFieldId: viewField.id,
              }),
            )
            .getValue();

          if (aggregateOperationForViewField !== viewField.aggregateOperation) {
            set(
              aggregateOperationForViewFieldState({
                viewFieldId: viewField.id,
              }),
              viewField.aggregateOperation,
            );
          }
        }
      },
    [columnDefinitions, setTableColumns],
  );

  const onViewGroupsChange = useCallback(
    (viewGroups: ViewGroup[]) => {
      const newGroupDefinitions = mapViewGroupsToRecordGroupDefinitions({
        objectMetadataItem,
        viewGroups,
      });

      setRecordGroup(newGroupDefinitions);
    },
    [objectMetadataItem, setRecordGroup],
  );

  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  return (
    <StyledContainer>
      <InformationBannerWrapper />
      <RecordFieldValueSelectorContextProvider>
        <SpreadsheetImportProvider>
          <ViewBar
            viewBarId={recordIndexId}
            optionsDropdownButton={
              <ObjectOptionsDropdown
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
              setTableViewFilterGroups(view.viewFilterGroups ?? []);
              setTableFilters(
                mapViewFiltersToFilters(view.viewFilters, filterDefinitions),
              );
              setRecordIndexFilters(
                mapViewFiltersToFilters(view.viewFilters, filterDefinitions),
              );
              setRecordIndexViewFilterGroups(view.viewFilterGroups ?? []);
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
              setRecordIndexViewKanbanAggregateOperationState({
                operation: view.kanbanAggregateOperation,
                fieldMetadataId: view.kanbanAggregateOperationFieldMetadataId,
              });
              setRecordIndexIsCompactModeActive(view.isCompact);
            }}
          />
          <RecordIndexViewBarEffect
            objectNamePlural={objectNamePlural}
            viewBarId={recordIndexId}
          />
        </SpreadsheetImportProvider>
        <RecordIndexFiltersToContextStoreEffect />
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
            <RecordIndexBoardDataLoaderEffect recordBoardId={recordIndexId} />
          </StyledContainerWithPadding>
        )}
        {!isPageHeaderV2Enabled && <RecordIndexActionMenu />}
      </RecordFieldValueSelectorContextProvider>
    </StyledContainer>
  );
};
