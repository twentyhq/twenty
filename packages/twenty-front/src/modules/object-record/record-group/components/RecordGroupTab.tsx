import { RecordGroupTabChip } from '@/object-record/record-group/components/RecordGroupTabChip';
import { RecordGroupTabCount } from '@/object-record/record-group/components/RecordGroupTabCount';
import { isAllRecordGroupsTabActiveComponentSelector } from '@/object-record/record-group/states/selectors/isAllRecordGroupsTabActiveComponentSelector';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { Tabs } from 'twenty-ui/primitives/navigation';

type RecordGroupTabProps = {
  recordGroupId: string;
  dndType: string;
};

export const RecordGroupTab = ({
  recordGroupId,
  dndType,
}: RecordGroupTabProps) => {
  const isAllRecordGroupsTabActive = useAtomComponentSelectorValue(
    isAllRecordGroupsTabActiveComponentSelector,
  );

  // The ungrouped rows shown under All drop by position, not by group
  const { ref: dropTargetRef, isDropTarget } = useDroppable({
    disabled: isAllRecordGroupsTabActive,
    id: `record-group-tab-${recordGroupId}`,
    accept: dndType,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data: { droppableId: recordGroupId },
  });

  return (
    <Tabs.Tab
      ref={dropTargetRef}
      variant="filled"
      value={recordGroupId}
      highlighted={isDropTarget}
      badge={<RecordGroupTabCount recordGroupTabId={recordGroupId} />}
    >
      <RecordGroupTabChip recordGroupTabId={recordGroupId} />
    </Tabs.Tab>
  );
};
