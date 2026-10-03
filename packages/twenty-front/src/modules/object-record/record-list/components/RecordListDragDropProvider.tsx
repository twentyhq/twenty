import { useStore } from 'jotai';
import { type ReactNode } from 'react';

import { RecordDragDropContextProvider } from '@/object-record/record-drag/components/RecordDragDropContextProvider';
import { useProcessRecordGroupDrop } from '@/object-record/record-drag/hooks/useProcessRecordGroupDrop';
import { useProcessRecordWithoutGroupDrop } from '@/object-record/record-drag/hooks/useProcessRecordWithoutGroupDrop';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordListRowDragOverlay } from '@/object-record/record-list/components/RecordListRowDragOverlay';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

type RecordListDragDropProviderProps = {
  children: ReactNode;
};

export const RecordListDragDropProvider = ({
  children,
}: RecordListDragDropProviderProps) => {
  const store = useStore();

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { processRecordGroupDrop } = useProcessRecordGroupDrop();
  const { processRecordWithoutGroupDrop } = useProcessRecordWithoutGroupDrop();

  return (
    <RecordDragDropContextProvider
      getDroppableItemCount={(droppableId) =>
        store.get(recordIdsByGroupCallbackState(droppableId)).length
      }
      onRecordDrop={
        hasRecordGroups ? processRecordGroupDrop : processRecordWithoutGroupDrop
      }
      renderDragOverlay={(source) => (
        <RecordListRowDragOverlay source={source} />
      )}
    >
      {children}
    </RecordDragDropContextProvider>
  );
};
