import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { PLACEHOLDER_RECORD_INDEX_ID } from '@/object-record/record-index/constants/PlaceholderRecordIndexId';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback } from 'react';
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

  const objectNamePlural = objectMetadataItem?.namePlural;

  const hasValidContext = isDefined(objectNamePlural);

  const recordIndexId = hasValidContext
    ? getRecordIndexIdFromObjectNamePluralAndViewId(
        objectNamePlural,
        contextStoreCurrentViewId ?? '',
      )
    : PLACEHOLDER_RECORD_INDEX_ID;

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const resetRecordIndexSelection = useCallback(() => {
    if (!hasValidContext) {
      return;
    }

    resetRecordSelection();
  }, [hasValidContext, resetRecordSelection]);

  return { resetRecordIndexSelection };
};
