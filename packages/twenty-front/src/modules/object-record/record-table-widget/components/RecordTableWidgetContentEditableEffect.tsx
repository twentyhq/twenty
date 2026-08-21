import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableColumnResizableComponentState } from '@/object-record/record-table/states/isRecordTableColumnResizableComponentState';
import { isRecordTableEmptyStateHiddenComponentState } from '@/object-record/record-table/states/isRecordTableEmptyStateHiddenComponentState';
import { useStore } from 'jotai';
import { useEffect } from 'react';

export const RecordTableWidgetContentEditableEffect = ({
  recordTableId,
  isWidgetContentEditable = false,
  isEmptyStateHidden = false,
}: {
  recordTableId: string;
  isWidgetContentEditable?: boolean;
  isEmptyStateHidden?: boolean;
}) => {
  const store = useStore();

  useEffect(() => {
    store.set(
      isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      !isWidgetContentEditable,
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
      isWidgetContentEditable,
    );

    store.set(
      isRecordTableCellsNonEditableComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      !isWidgetContentEditable,
    );

    store.set(
      isRecordTableEmptyStateHiddenComponentState.atomFamily({
        instanceId: recordTableId,
      }),
      isEmptyStateHidden,
    );
  }, [store, recordTableId, isWidgetContentEditable, isEmptyStateHidden]);

  return null;
};
