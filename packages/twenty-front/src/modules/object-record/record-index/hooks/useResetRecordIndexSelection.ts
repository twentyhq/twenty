import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const PLACEHOLDER_RECORD_INDEX_ID = 'placeholder-record-index-id';

export const useResetRecordIndexSelection = (
  contextStoreInstanceId?: string,
) => {
  const store = useStore();

  const { objectMetadataItem } = useContextStoreObjectMetadataItem(
    contextStoreInstanceId,
  );

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    contextStoreInstanceId,
  );

  const contextStoreCurrentViewTypeAtom = useAtomComponentStateCallbackState(
    contextStoreCurrentViewTypeComponentState,
    contextStoreInstanceId,
  );

  const objectNamePlural = objectMetadataItem?.namePlural;

  const hasValidContext = isDefined(objectNamePlural);

  const recordIndexId = hasValidContext
    ? getRecordIndexIdFromObjectNamePluralAndViewId(
        objectNamePlural,
        contextStoreCurrentViewId ?? '',
      )
    : PLACEHOLDER_RECORD_INDEX_ID;

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordIndexId);

  const resetRecordIndexSelection = useCallback(() => {
    if (!hasValidContext) {
      return;
    }

    const contextStoreCurrentViewType = store.get(
      contextStoreCurrentViewTypeAtom,
    );

    switch (contextStoreCurrentViewType) {
      case ContextStoreViewType.Table:
        resetTableRowSelection();
        break;
      case ContextStoreViewType.Kanban:
        resetRecordBoardSelection();
        break;
    }
  }, [
    hasValidContext,
    store,
    contextStoreCurrentViewTypeAtom,
    resetTableRowSelection,
    resetRecordBoardSelection,
  ]);

  return { resetRecordIndexSelection };
};
