import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useRecordIndexIdFromCurrentContextStore = () => {
  const contextStoreCurrentViewId = useAtomComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    contextStoreCurrentViewId || '',
  );

  return {
    objectMetadataItem,
    recordIndexId,
  };
};
