import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useResetRecordIndexSelection = (
  contextStoreInstanceId?: string,
) => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItem(
    contextStoreInstanceId,
  );

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    contextStoreInstanceId,
  );

  const contextStoreCurrentViewType = useAtomComponentStateValue(
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
    : '';

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordIndexId);

  const resetRecordIndexSelection = () => {
    if (!hasValidContext) {
      return;
    }

    switch (contextStoreCurrentViewType) {
      case ContextStoreViewType.Table:
        resetTableRowSelection();
        break;
      case ContextStoreViewType.Kanban:
        resetRecordBoardSelection();
        break;
    }
  };

  return { resetRecordIndexSelection };
};
