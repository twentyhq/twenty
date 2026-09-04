import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableColumnResizableComponentState } from '@/object-record/record-table/states/isRecordTableColumnResizableComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { isRecordTableEmptyStateHiddenComponentState } from '@/object-record/record-table/states/isRecordTableEmptyStateHiddenComponentState';
import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

type RecordTableWidgetStatesEffectProps = {
  recordTableId: string;
  isUIEditable?: boolean;
  isPageLayoutInEditMode?: boolean;
  isEmptyStateHidden?: boolean;
};

export const RecordTableWidgetStatesEffect = ({
  recordTableId,
  isUIEditable = false,
  isPageLayoutInEditMode = false,
  isEmptyStateHidden = false,
}: RecordTableWidgetStatesEffectProps) => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  useLayoutEffect(() => {
    store.set(
      isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
        instanceId: recordTableId,
        surfaceId,
      }),
      true,
    );

    store.set(
      isRecordTableDragColumnHiddenComponentState.atomFamily({
        instanceId: recordTableId,
        surfaceId,
      }),
      true,
    );

    store.set(
      isRecordTableCheckboxColumnHiddenComponentState.atomFamily({
        instanceId: recordTableId,
        surfaceId,
      }),
      true,
    );

    store.set(
      isRecordTableColumnResizableComponentState.atomFamily({
        instanceId: recordTableId,
        surfaceId,
      }),
      isPageLayoutInEditMode,
    );

    store.set(
      isRecordTableCellsNonEditableComponentState.atomFamily({
        instanceId: recordTableId,
        surfaceId,
      }),
      !isUIEditable,
    );

    store.set(
      isRecordTableEmptyStateHiddenComponentState.atomFamily({
        instanceId: recordTableId,
        surfaceId,
      }),
      isEmptyStateHidden,
    );

    return () => {
      store.set(
        isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
          instanceId: recordTableId,
          surfaceId,
        }),
        false,
      );
      store.set(
        isRecordTableDragColumnHiddenComponentState.atomFamily({
          instanceId: recordTableId,
          surfaceId,
        }),
        false,
      );
      store.set(
        isRecordTableCheckboxColumnHiddenComponentState.atomFamily({
          instanceId: recordTableId,
          surfaceId,
        }),
        false,
      );
      store.set(
        isRecordTableColumnResizableComponentState.atomFamily({
          instanceId: recordTableId,
          surfaceId,
        }),
        true,
      );
      store.set(
        isRecordTableCellsNonEditableComponentState.atomFamily({
          instanceId: recordTableId,
          surfaceId,
        }),
        false,
      );
      store.set(
        isRecordTableEmptyStateHiddenComponentState.atomFamily({
          instanceId: recordTableId,
          surfaceId,
        }),
        false,
      );
    };
  }, [
    store,
    recordTableId,
    isUIEditable,
    isPageLayoutInEditMode,
    isEmptyStateHidden,
    surfaceId,
  ]);

  return null;
};
