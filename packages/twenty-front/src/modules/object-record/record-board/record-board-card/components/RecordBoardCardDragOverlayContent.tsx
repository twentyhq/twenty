import { type Draggable } from '@dnd-kit/dom';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardCardMultiDragPreview } from '@/object-record/record-board/record-board-card/components/RecordBoardCardMultiDragPreview';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { ViewType } from '@/views/types/ViewType';

type RecordBoardCardDragOverlayContentProps = {
  source: Draggable | null;
};

export const RecordBoardCardDragOverlayContent = ({
  source,
}: RecordBoardCardDragOverlayContentProps) => {
  const { objectMetadataItem } = useContext(RecordBoardContext);

  const sourceData = source?.data as DragDropItemData | undefined;

  const columnId = sourceData?.droppableId ?? '';
  const rowIndex = sourceData?.index ?? 0;
  const recordId = isDefined(source) ? String(source.id) : '';

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  const columnIndex = visibleRecordGroupIds.indexOf(columnId);

  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    columnId,
  );

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    columnId,
  );

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  if (!isDefined(source) || !isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnDefinition: recordGroupDefinition,
        columnId,
        recordIds: recordIndexRecordIdsByGroup,
        columnIndex,
      }}
    >
      <RecordBoardCardContext.Provider
        value={{
          recordId,
          isRecordReadOnly,
          rowIndex,
          columnIndex,
          isDragOverlay: true,
        }}
      >
        <RecordBoardCard />
        <RecordBoardCardMultiDragPreview />
      </RecordBoardCardContext.Provider>
    </RecordBoardColumnContext.Provider>
  );
};
