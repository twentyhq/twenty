import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordListAddNew } from '@/object-record/record-list/components/RecordListAddNew';
import { RecordListDraggableRow } from '@/object-record/record-list/components/RecordListDraggableRow';
import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';
import { RECORD_LIST_ROW_DND_TYPE } from '@/object-record/record-list/constants/RecordListRowDndType';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';

const StyledFetchMoreTrigger = styled.div`
  height: 0;
`;

const StyledEndDropZone = styled.div`
  position: relative;
  width: 100%;
`;

type RecordListRecordsProps = {
  records: ObjectRecord[];
  loading: boolean;
  error?: Error;
  hasNextPage: boolean;
  fetchMoreRecords: () => void;
  isVisible?: boolean;
};

export const RecordListRecords = ({
  records,
  loading,
  error,
  hasNextPage,
  fetchMoreRecords,
  isVisible = true,
}: RecordListRecordsProps) => {
  const { recordGroupId } = useContext(RecordGroupContext);

  const droppableId = isDefined(recordGroupId)
    ? recordGroupId
    : NO_RECORD_GROUP_FAMILY_KEY;

  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  // Catches drops past the last row, where no row is under the pointer
  const { ref: endDropZoneRef } = useDroppable({
    id: droppableId,
    accept: RECORD_LIST_ROW_DND_TYPE,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    data: { droppableId },
  });

  const { ref: fetchMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords();
      }
    },
  });

  return (
    <>
      <RecordListUpsertRecordsInStoreEffect records={records} />
      {isVisible && !isDefined(error) && (
        <>
          {records.map((record, index) => (
            <RecordListDraggableRow
              key={record.id}
              recordId={record.id}
              index={index}
              droppableId={droppableId}
            />
          ))}
          {hasNextPage && !loading && (
            <StyledFetchMoreTrigger ref={fetchMoreRef} />
          )}
          <StyledEndDropZone ref={endDropZoneRef}>
            <DragDropItemDropTarget
              index={records.length}
              droppableId={droppableId}
              orientation="horizontal"
              compact={!isDraggingRecord}
              seamAligned
            />
            {!loading && <RecordListAddNew />}
          </StyledEndDropZone>
        </>
      )}
    </>
  );
};
