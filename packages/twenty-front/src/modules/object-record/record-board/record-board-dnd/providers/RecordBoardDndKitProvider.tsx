import { useStore } from 'jotai';
import type { ReactNode } from 'react';

import { RecordBoardCardDragOverlayContent } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDragOverlayContent';
import { RecordDragDropContextProvider } from '@/object-record/record-drag/components/RecordDragDropContextProvider';
import { useProcessBoardCardDrop } from '@/object-record/record-drag/hooks/useProcessBoardCardDrop';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

type RecordBoardDndKitProviderProps = {
  children: ReactNode;
};

export const RecordBoardDndKitProvider = ({
  children,
}: RecordBoardDndKitProviderProps) => {
  const store = useStore();

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { processBoardCardDrop } = useProcessBoardCardDrop();

  return (
    <RecordDragDropContextProvider
      getDroppableItemCount={(droppableId) =>
        store.get(recordIdsByGroupCallbackState(droppableId)).length
      }
      onRecordDrop={processBoardCardDrop}
      renderDragOverlay={(source) => (
        <RecordBoardCardDragOverlayContent source={source} />
      )}
    >
      {children}
    </RecordDragDropContextProvider>
  );
};
