import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { lastVisitedObjectMetadataItemStateSelector } from '@/navigation/states/selectors/lastVisitedObjectMetadataItemStateSelector';
import { lastVisitedViewPerObjectMetadataItemStateSelector } from '@/navigation/states/selectors/lastVisitedViewPerObjectMetadataItemStateSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLastVisitedPageOrView = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const scopeId = currentWorkspace?.id ?? '';

  const lastVisitedObjectMetadataItemState = extractComponentState(
    lastVisitedObjectMetadataItemStateSelector,
    scopeId,
  );

  const lastVisitedViewPerObjectMetadataItemState = extractComponentState(
    lastVisitedViewPerObjectMetadataItemStateSelector,
    scopeId,
  );

  const [lastVisitedObjectMetadataItem, setLastVisitedObjectMetadataItem] =
    useRecoilState(lastVisitedObjectMetadataItemState);

  const [
    lastVisitedViewPerObjectMetadataItem,
    setLastVisitedViewPerObjectMetadataItem,
  ] = useRecoilState(lastVisitedViewPerObjectMetadataItemState);

  const {
    findActiveObjectMetadataItemBySlug,
    alphaSortedActiveObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const lastVisitedObjectMetadataItemId = lastVisitedObjectMetadataItem ?? null;

  const removeMatchingIdInCaseLastVisited = ({
    objectMetadataItemId,
  }: {
    objectMetadataItemId: string;
  }) => {
    const isDeactivateDefault = isDeeplyEqual(
      lastVisitedObjectMetadataItemId,
      objectMetadataItemId,
    );

    const [newFallbackObjectMetadataItem] =
      alphaSortedActiveObjectMetadataItems.filter(
        (item) => item.id !== objectMetadataItemId,
      );

    if (isDeactivateDefault) {
      setLastVisitedObjectMetadataItem(newFallbackObjectMetadataItem.id);
      setNavigationMemorizedUrl(
        `/objects/${newFallbackObjectMetadataItem.namePlural}`,
      );
    }
    /* ...{} allows us to pass value as undefined to remove that particular key
     even though param type is of type Record<string,string> */
    setLastVisitedViewPerObjectMetadataItem({
      ...{},
      [objectMetadataItemId]: undefined,
    });
  };

  const setLastVisitedObjectOrView = ({
    objectNamePlural,
    viewId,
  }: {
    objectNamePlural: string;
    viewId: string;
  }) => {
    const fallbackObjectMetadataItemId =
      findActiveObjectMetadataItemBySlug(objectNamePlural)?.id ?? '';
    /* when both are equal meaning there was change in view else 
      there was a object page change from nav
    */
    const fallbackViewId =
      lastVisitedObjectMetadataItemId === fallbackObjectMetadataItemId
        ? viewId
        : (lastVisitedViewPerObjectMetadataItem?.[
            fallbackObjectMetadataItemId
          ] ?? viewId);

    setLastVisitedObjectMetadataItem(fallbackObjectMetadataItemId);
    setLastVisitedViewPerObjectMetadataItem({
      [fallbackObjectMetadataItemId]: fallbackViewId,
    });
  };

  const getLastVisitedViewId = (pluralName: string) => {
    const objectMetadataId: string | undefined =
      findActiveObjectMetadataItemBySlug(pluralName)?.id;
    return objectMetadataId
      ? lastVisitedViewPerObjectMetadataItem?.[objectMetadataId]
      : undefined;
  };

  const getLastVisitedViewIdFromObjectId = (objectMetadataId: string) => {
    return lastVisitedViewPerObjectMetadataItem?.[objectMetadataId];
  };
  return {
    lastVisitedObjectMetadataItemId,
    setLastVisitedObjectOrView,
    getLastVisitedViewId,
    getLastVisitedViewIdFromObjectId,
    removeMatchingIdInCaseLastVisited,
  };
};
