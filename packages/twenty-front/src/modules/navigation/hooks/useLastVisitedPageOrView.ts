import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { lastVisitedPageOrViewStateSelector } from '@/navigation/states/selectors/lastVisitedPageOrViewStateSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLastVisitedPageOrView = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const scopeId = currentWorkspace?.id ?? '';
  const currentPagesState = extractComponentState(
    lastVisitedPageOrViewStateSelector,
    scopeId,
  );
  const [currentPages, setCurrentPages] = useRecoilState(currentPagesState);
  const {
    findActiveObjectMetadataItemBySlug,
    alphaSortedActiveObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const lastVisitedObjectMetadataItemId =
    currentPages?.['last_visited_object'] ?? null;

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

    setCurrentPages({
      ...(isDeactivateDefault && {
        last_visited_object: newFallbackObjectMetadataItem.id,
      }),
      [objectMetadataItemId]: undefined,
    });

    if (isDeactivateDefault) {
      setNavigationMemorizedUrl(
        `/objects/${newFallbackObjectMetadataItem.namePlural}`,
      );
    }
  };

  const setLastVisitedObjectOrView = ({
    componentId,
    viewId,
  }: {
    componentId: string;
    viewId: string;
  }) => {
    const fallbackObjectMetadataItemId =
      findActiveObjectMetadataItemBySlug(componentId)?.id ?? '';
    /* when both are equal meaning there was change in view else 
      there was a object page change from nav
    */
    const fallbackViewId =
      lastVisitedObjectMetadataItemId === fallbackObjectMetadataItemId
        ? viewId
        : (currentPages?.[fallbackObjectMetadataItemId] ?? viewId);

    setCurrentPages({
      last_visited_object: fallbackObjectMetadataItemId,
      [fallbackObjectMetadataItemId]: fallbackViewId,
    });
  };

  const getLastVisitedViewId = (pluralName: string) => {
    const objectMetadataId: string | undefined =
      findActiveObjectMetadataItemBySlug(pluralName)?.id;
    return objectMetadataId ? currentPages?.[objectMetadataId] : undefined;
  };

  const getLastVisitedViewIdFromObjectId = (objectMetadataId: string) => {
    return currentPages?.[objectMetadataId];
  };
  return {
    lastVisitedObjectMetadataItemId,
    setLastVisitedObjectOrView,
    getLastVisitedViewId,
    getLastVisitedViewIdFromObjectId,
    removeMatchingIdInCaseLastVisited,
  };
};
