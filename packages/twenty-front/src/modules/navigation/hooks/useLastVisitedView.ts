import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { lastVisitedViewPerObjectMetadataItemStateSelector } from '@/navigation/states/selectors/lastVisitedViewPerObjectMetadataItemStateSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useLastVisitedView = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const scopeId = currentWorkspace?.id ?? '';

  const lastVisitedViewPerObjectMetadataItemState = extractComponentState(
    lastVisitedViewPerObjectMetadataItemStateSelector,
    scopeId,
  );

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

  const setLastVisitedView = ({
    objectNamePlural,
    viewId,
  }: {
    objectNamePlural: string;
    viewId: string;
  }) => {
    const objectMetadataItem =
      findActiveObjectMetadataItemByNamePlural(objectNamePlural);

    if (isDefined(objectMetadataItem)) {
      setLastVisitedViewPerObjectMetadataItem({
        [objectMetadataItem.id]: viewId,
      });
    }
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
    setLastVisitedView,
    getLastVisitedViewIdFromObjectNamePlural,
    getLastVisitedViewIdFromObjectMetadataItemId,
    setFallbackForLastVisitedView,
  };
};
