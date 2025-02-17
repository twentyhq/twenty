import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRecoilState } from 'recoil';

export const useLastVisitedView = () => {
  const [
    lastVisitedViewPerObjectMetadataItem,
    setLastVisitedViewPerObjectMetadataItem,
  ] = useRecoilState(lastVisitedViewPerObjectMetadataItemState);

  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const setFallbackForLastVisitedView = (objectMetadataItemId: string) => {
    /* ...{} allows us to pass value as undefined to remove that particular key
     even though param type is of type Record<string,string> */

    setLastVisitedViewPerObjectMetadataItem({
      ...{},
      [objectMetadataItemId]: undefined,
    });
  };

  const getLastVisitedViewIdFromObjectNamePlural = (
    objectNamePlural: string,
  ) => {
    const objectMetadataItemId: string | undefined =
      findActiveObjectMetadataItemByNamePlural(objectNamePlural)?.id;
    return objectMetadataItemId
      ? lastVisitedViewPerObjectMetadataItem?.[objectMetadataItemId]
      : undefined;
  };

  const getLastVisitedViewIdFromObjectMetadataItemId = (
    objectMetadataItemId: string,
  ) => {
    return lastVisitedViewPerObjectMetadataItem?.[objectMetadataItemId];
  };
  return {
    getLastVisitedViewIdFromObjectNamePlural,
    getLastVisitedViewIdFromObjectMetadataItemId,
    setFallbackForLastVisitedView,
  };
};
