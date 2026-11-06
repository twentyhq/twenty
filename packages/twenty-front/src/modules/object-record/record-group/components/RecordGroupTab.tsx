import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { isDefined } from 'twenty-shared/utils';
import { Tabs } from 'twenty-ui/primitives/navigation';

type RecordGroupTabProps = {
  recordGroupId: string;
  dndType: string;
};

export const RecordGroupTab = ({
  recordGroupId,
  dndType,
}: RecordGroupTabProps) => {
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    recordGroupId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexAggregateDisplayValueForGroupValue =
    useAtomComponentFamilyStateValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: recordGroupDefinition?.value ?? '' },
    );

  const { ref: dropTargetRef, isDropTarget } = useDroppable({
    id: `record-group-tab-${recordGroupId}`,
    accept: dndType,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data: { droppableId: recordGroupId },
  });

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <Tabs.Tab
      ref={dropTargetRef}
      value={recordGroupId}
      highlighted={isDropTarget}
      badge={
        isDefined(recordIndexAggregateDisplayValueForGroupValue)
          ? recordIndexAggregateDisplayValueForGroupValue
          : '-'
      }
    >
      <RecordGroupChip
        recordGroupDefinition={recordGroupDefinition}
        fieldMetadataItem={recordIndexGroupFieldMetadataItem}
        valueTagWeight="medium"
      />
    </Tabs.Tab>
  );
};
