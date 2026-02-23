import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useLastVisitedView = () => {
  const lastVisitedViewPerObjectMetadataItem = useRecoilValueV2(
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
