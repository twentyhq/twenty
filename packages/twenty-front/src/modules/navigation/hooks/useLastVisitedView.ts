import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRecoilValue } from 'recoil';

export const useLastVisitedView = () => {
  const lastVisitedViewPerObjectMetadataItem = useRecoilValue(
    lastVisitedViewPerObjectMetadataItemState,
  );

  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

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
  };
};
