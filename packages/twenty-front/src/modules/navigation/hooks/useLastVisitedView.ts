import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { lastVisitedObjectMetadataItemIdStateSelector } from '@/navigation/states/selectors/lastVisitedObjectMetadataItemIdStateSelector';
import { lastVisitedViewPerObjectMetadataItemStateSelector } from '@/navigation/states/selectors/lastVisitedViewPerObjectMetadataItemStateSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useLastVisitedView = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const scopeId = currentWorkspace?.id ?? '';

  const lastVisitedObjectMetadataItemState = extractComponentState(
    lastVisitedObjectMetadataItemIdStateSelector,
    scopeId,
  );

  const lastVisitedViewPerObjectMetadataItemState = extractComponentState(
    lastVisitedViewPerObjectMetadataItemStateSelector,
    scopeId,
  );

  const lastVisitedObjectMetadataItem = useRecoilValue(
    lastVisitedObjectMetadataItemState,
  );
  const lastVisitedObjectMetadataItemId = lastVisitedObjectMetadataItem ?? null;

  const [
    lastVisitedViewPerObjectMetadataItem,
    setLastVisitedViewPerObjectMetadataItem,
  ] = useRecoilState(lastVisitedViewPerObjectMetadataItemState);

  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const setFallbackForLastVisitedView = (objectMetadataItemId: string) => {
    /* ...{} allows us to pass value as undefined to remove that particular key
     even though param type is of type Record<string,string> */
    setLastVisitedViewPerObjectMetadataItem({
      ...{},
      [objectMetadataItemId]: undefined,
    });
  };

  const setLastVisitedViewForObjectNamePlural = ({
    objectNamePlural,
    viewId,
  }: {
    objectNamePlural: string;
    viewId: string;
  }) => {
    const fallbackObjectMetadataItem =
      findActiveObjectMetadataItemBySlug(objectNamePlural);

    if (isDefined(fallbackObjectMetadataItem)) {
      /* when both are equal meaning there was change in view else 
      there was a object page change from nav
    */
      const fallbackViewId =
        lastVisitedObjectMetadataItemId === fallbackObjectMetadataItem.id
          ? viewId
          : (lastVisitedViewPerObjectMetadataItem?.[
              fallbackObjectMetadataItem.id
            ] ?? viewId);

      setLastVisitedViewPerObjectMetadataItem({
        [fallbackObjectMetadataItem.id]: fallbackViewId,
      });
    }
  };

  const getLastVisitedViewIdFromPluralName = (objectNamePlural: string) => {
    const objectMetadataItemId: string | undefined =
      findActiveObjectMetadataItemBySlug(objectNamePlural)?.id;
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
    setLastVisitedViewForObjectNamePlural,
    getLastVisitedViewIdFromPluralName,
    getLastVisitedViewIdFromObjectMetadataItemId,
    setFallbackForLastVisitedView,
  };
};
