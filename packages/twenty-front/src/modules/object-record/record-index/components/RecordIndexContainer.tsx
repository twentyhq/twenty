import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
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

import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuBar } from '@/action-menu/components/ActionMenuBar';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { ActionMenuDropdown } from '@/action-menu/components/ActionMenuDropdown';
import { ActionMenuEffect } from '@/action-menu/components/ActionMenuEffect';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewField } from '@/views/types/ViewField';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useCallback, useContext } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { ViewGroup } from '@/views/types/ViewGroup';
import { mapViewGroupsToGroupDefinitions } from '@/views/utils/mapViewGroupsToGroupDefinitions';
import { recordIndexGroupDefinitionsState } from '@/object-record/record-index/states/recordIndexGroupDefinitionsState';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { IconSettings } from 'twenty-ui';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const StyledContainerWithPadding = styled.div<{ fullHeight?: boolean }>`
  height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};
  padding-left: ${({ theme }) => theme.table.horizontalCellPadding};
`;

export const RecordIndexContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const [recordIndexViewType, setRecordIndexViewType] = useRecoilState(
    recordIndexViewTypeState,
  );

  const { objectNamePlural, recordIndexId } = useContext(
    RecordIndexRootPropsContext,
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

  const { setColumns } = useRecordBoard(recordIndexId);

  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);
    navigate(`/settings/objects/${getObjectSlug(objectMetadataItem)}`);
  }, [
    navigate,
    objectMetadataItem,
    location.pathname,
    location.search,
    setNavigationMemorizedUrl,
  ]);

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
        let newGroupDefinitions = mapViewGroupsToGroupDefinitions({
          objectMetadataItem,
          viewGroups,
        });

        newGroupDefinitions = newGroupDefinitions.map((groupDefition) => ({
          ...groupDefition,
          actions: [
            {
              id: 'edit',
              label: 'Edit',
              icon: IconSettings,
              position: 0,
              callback: () => {
                navigateToSelectSettings();
              },
            },
            // TODO: Maybe we should define actions somewhere else
            // {
            //   id: 'hide',
            //   label: 'Hide',
            //   icon: IconEyeOff,
            //   position: 1,
            //   callback: () => {
            //     handleBoardGroupVisibilityChange(groupDefition);
            //   },
            // },
          ],
        }));

        setColumns(newGroupDefinitions);

        const existingRecordIndexGroupDefinitions = snapshot
          .getLoadable(recordIndexGroupDefinitionsState)
          .getValue();

        if (
          !isDeeplyEqual(
            existingRecordIndexGroupDefinitions,
            newGroupDefinitions,
          )
        ) {
          set(recordIndexGroupDefinitionsState, newGroupDefinitions);
        }
      },
    [navigateToSelectSettings, objectMetadataItem, setColumns],
  );

  return (
    <StyledContainer>
      <InformationBannerWrapper />
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
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
                  onViewGroupsChange(view.viewGroups);
                  setTableFilters(
                    mapViewFiltersToFilters(
                      view.viewFilters,
                      filterDefinitions,
                    ),
                  );
                  setRecordIndexFilters(
                    mapViewFiltersToFilters(
                      view.viewFilters,
                      filterDefinitions,
                    ),
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

          {recordIndexViewType === ViewType.Table && (
            <>
              <RecordIndexTableContainer
                recordTableId={recordIndexId}
                viewBarId={recordIndexId}
              />
              <RecordIndexTableContainerEffect
                objectNameSingular={objectNameSingular}
                recordTableId={recordIndexId}
                viewBarId={recordIndexId}
              />
            </>
          )}
          {recordIndexViewType === ViewType.Kanban && (
            <StyledContainerWithPadding fullHeight>
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
          <ActionMenuComponentInstanceContext.Provider
            value={{ instanceId: recordIndexId }}
          >
            <ActionMenuEffect />
            <RecordActionMenuEntriesSetter />
            <ActionMenuBar />
            <ActionMenuDropdown />
            <ActionMenuConfirmationModals />
          </ActionMenuComponentInstanceContext.Provider>
        </RecordFieldValueSelectorContextProvider>
      </ViewComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
