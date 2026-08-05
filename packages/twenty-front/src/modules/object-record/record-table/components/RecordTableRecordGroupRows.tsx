import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';

import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { RecordTableRecordGroupSectionAddNew } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionAddNew';
import { RecordTableRecordGroupSectionLoadMore } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSectionLoadMore';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledRecordGroupDropTarget = styled.div`
  position: relative;
  width: 100%;
`;

export const RecordTableRecordGroupRows = () => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const shouldHide = useShouldHideRecordGroup(currentRecordGroupId);

  const allRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  const isRecordGroupTableSectionToggled = useAtomComponentFamilyStateValue(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
  );

  const rowIndexMap = useMemo(
    () => new Map(allRecordIds.map((recordId, index) => [recordId, index])),
    [allRecordIds],
  );

  const { ref: endDropZoneRef } = useDroppable({
    id: currentRecordGroupId,
    accept: RECORD_TABLE_ROW_DND_TYPE,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data: { droppableId: currentRecordGroupId },
  });

  if (shouldHide) {
    return null;
  }

  if (!isRecordGroupTableSectionToggled) {
    return null;
  }

  return (
    <>
      {recordIndexRecordIdsByGroup.map((recordId, rowIndexInGroup) => {
        const rowIndex = rowIndexMap.get(recordId);

        if (!isDefined(rowIndex)) {
          return null;
        }

        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndexForFocus={rowIndex}
            rowIndexForDrag={rowIndexInGroup}
          />
        );
      })}
      <StyledRecordGroupDropTarget ref={endDropZoneRef}>
        <DragDropItemDropTarget
          index={recordIndexRecordIdsByGroup.length}
          droppableId={currentRecordGroupId}
          orientation="horizontal"
          compact
          seamAligned
        />
        <RecordTableRecordGroupSectionLoadMore />
        <RecordTableRecordGroupSectionAddNew />
      </StyledRecordGroupDropTarget>
      <RecordTableAggregateFooter
        key={currentRecordGroupId}
        currentRecordGroupId={currentRecordGroupId}
      />
    </>
  );
};
