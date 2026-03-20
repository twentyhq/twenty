import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableColumnResizableComponentState } from '@/object-record/record-table/states/isRecordTableColumnResizableComponentState';
import { useStore } from 'jotai';
import { useEffect } from 'react';

export const StandaloneRecordTableSetReadOnlyColumnHeadersEffect = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const store = useStore();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  useEffect(() => {
    store.set(
      isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      true,
    );

    store.set(
      isRecordTableColumnResizableComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      isPageLayoutInEditMode,
    );

    store.set(
      isRecordTableCellsNonEditableComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      true,
    );
  }, [store, recordTableId, isPageLayoutInEditMode]);

  return null;
};
