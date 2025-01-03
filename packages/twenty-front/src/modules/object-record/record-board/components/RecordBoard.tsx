import styled from '@emotion/styled';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useContext, useRef } from 'react';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { useActionMenu } from '@/action-menu/hooks/useActionMenu';
import { ActionBarHotkeyScope } from '@/action-menu/types/ActionBarHotKeyScope';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardStickyHeaderEffect } from '@/object-record/record-board/components/RecordBoardStickyHeaderEffect';
import { RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-board/constants/RecordBoardClickOutsideListenerId';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { ViewType } from '@/views/types/ViewType';
import { useScrollRestoration } from '~/hooks/useScrollRestoration';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`;

const StyledColumnContainer = styled.div`
  display: flex;
  & > *:not(:first-of-type) {
    border-left: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledBoardContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 48px);
`;

const RecordBoardScrollRestoreEffect = () => {
  useScrollRestoration();
  return null;
};

export const RecordBoard = () => {
  const { updateOneRecord, selectFieldMetadataItem, recordBoardId } =
    useContext(RecordBoardContext);
  const boardRef = useRef<HTMLDivElement>(null);

  const { toggleClickOutsideListener } = useClickOutsideListener(
    RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID,
  );

  const actionMenuId = getActionMenuIdFromRecordIndexId(recordBoardId);
  const { closeActionMenuDropdown } = useActionMenu(actionMenuId);

  const handleDragSelectionStart = () => {
    closeActionMenuDropdown();

    toggleClickOutsideListener(false);
  };

  const handleDragSelectionEnd = () => {
    toggleClickOutsideListener(true);
  };

  const visibleRecordGroupIds = useRecoilComponentFamilyValueV2(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordIndexAllRecordIdsState = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { resetRecordSelection, setRecordAsSelected } =
    useRecordBoardSelection(recordBoardId);

  useListenClickOutside({
    excludeClassNames: [
      'bottom-bar',
      'action-menu-dropdown',
      'command-menu',
      'modal-backdrop',
      'page-action-container',
      'record-board-card',
    ],
    listenerId: RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID,
    refs: [],
    callback: () => {
      resetRecordSelection();
    },
  });

  const selectAll = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsState,
        );

        for (const recordId of allRecordIds) {
          setRecordAsSelected(recordId, true);
        }
      },
    [recordIndexAllRecordIdsState, setRecordAsSelected],
  );

  useScopedHotkeys('ctrl+a,meta+a', selectAll, TableHotkeyScope.Table);
  useScopedHotkeys('ctrl+a,meta+a', selectAll, ActionBarHotkeyScope.ActionBar);

  useScopedHotkeys(
    Key.Escape,
    resetRecordSelection,
    ActionBarHotkeyScope.ActionBar,
  );

  const handleDragEnd: OnDragEndResponder = useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        if (!result.destination) return;

        const draggedRecordId = result.draggableId;
        const sourceRecordGroupId = result.source.droppableId;
        const destinationRecordGroupId = result.destination.droppableId;
        const destinationIndexInColumn = result.destination.index;

        if (!destinationRecordGroupId || !selectFieldMetadataItem) return;

        const recordGroup = getSnapshotValue(
          snapshot,
          recordGroupDefinitionFamilyState(destinationRecordGroupId),
        );

        if (!recordGroup) return;

        const destinationRecordByGroupIds = getSnapshotValue(
          snapshot,
          recordIndexRecordIdsByGroupFamilyState(destinationRecordGroupId),
        );
        const otherRecordIdsInDestinationColumn =
          sourceRecordGroupId === destinationRecordGroupId
            ? destinationRecordByGroupIds.filter(
                (recordId) => recordId !== draggedRecordId,
              )
            : destinationRecordByGroupIds;

        const recordBeforeId =
          otherRecordIdsInDestinationColumn[destinationIndexInColumn - 1];
        const recordBefore = recordBeforeId
          ? getSnapshotValue(snapshot, recordStoreFamilyState(recordBeforeId))
          : null;

        const recordAfterId =
          otherRecordIdsInDestinationColumn[destinationIndexInColumn];
        const recordAfter = recordAfterId
          ? getSnapshotValue(snapshot, recordStoreFamilyState(recordAfterId))
          : null;

        const draggedRecordPosition = getDraggedRecordPosition(
          recordBefore?.position,
          recordAfter?.position,
        );

        updateOneRecord({
          idToUpdate: draggedRecordId,
          updateOneRecordInput: {
            [selectFieldMetadataItem.name]: recordGroup.value,
            position: draggedRecordPosition,
          },
        });
      },
    [
      recordIndexRecordIdsByGroupFamilyState,
      selectFieldMetadataItem,
      updateOneRecord,
    ],
  );

  // FixMe: Check if we really need this as it depends on the times it takes to update the view groups
  // if (isPersistingViewGroups) {
  //   // TODO: Add skeleton state
  //   return null;
  // }

  return (
    <RecordBoardScope
      recordBoardScopeId={getScopeIdFromComponentId(recordBoardId)}
      onColumnsChange={() => {}}
      onFieldsChange={() => {}}
    >
      <RecordBoardComponentInstanceContext.Provider
        value={{ instanceId: recordBoardId }}
      >
        <ScrollWrapper
          contextProviderName="recordBoard"
          componentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
        >
          <RecordBoardStickyHeaderEffect />
          <StyledContainerContainer>
            <RecordBoardHeader />
            <StyledBoardContentContainer>
              <StyledContainer ref={boardRef}>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <StyledColumnContainer>
                    {visibleRecordGroupIds.map((recordGroupId) => (
                      <RecordBoardColumn
                        key={recordGroupId}
                        recordBoardColumnId={recordGroupId}
                      />
                    ))}
                  </StyledColumnContainer>
                </DragDropContext>
              </StyledContainer>
              <RecordBoardScrollRestoreEffect />
              <DragSelect
                dragSelectable={boardRef}
                onDragSelectionEnd={handleDragSelectionEnd}
                onDragSelectionChange={setRecordAsSelected}
                onDragSelectionStart={handleDragSelectionStart}
              />
            </StyledBoardContentContainer>
          </StyledContainerContainer>
        </ScrollWrapper>
      </RecordBoardComponentInstanceContext.Provider>
    </RecordBoardScope>
  );
};
