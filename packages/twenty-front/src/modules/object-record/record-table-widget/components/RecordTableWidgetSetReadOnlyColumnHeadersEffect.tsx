import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableColumnResizableComponentState } from '@/object-record/record-table/states/isRecordTableColumnResizableComponentState';
import { isRecordTableEmptyStateHiddenComponentState } from '@/object-record/record-table/states/isRecordTableEmptyStateHiddenComponentState';
import { useStore } from 'jotai';
import { useEffect } from 'react';

export const RecordTableWidgetSetReadOnlyColumnHeadersEffect = ({
  recordTableId,
  isReadOnly = true,
  isEmptyStateHidden = false,
}: {
  recordTableId: string;
  isReadOnly?: boolean;
  isEmptyStateHidden?: boolean;
}) => {
  const store = useStore();

  useEffect(() => {
    store.set(
      isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      true,
    );

    store.set(
      isRecordTableDragColumnHiddenComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      true,
    );

    store.set(
      isRecordTableCheckboxColumnHiddenComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      true,
    );

    store.set(
      isRecordTableColumnResizableComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      true,
    );

    store.set(
      isRecordTableCellsNonEditableComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      isReadOnly,
    );

    store.set(
      isRecordTableEmptyStateHiddenComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      isEmptyStateHidden,
    );
  }, [store, recordTableId, isReadOnly, isEmptyStateHidden]);

  return null;
};
