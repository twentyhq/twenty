import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { lastVisitedObjectMetadataItemIdStateSelector } from '@/navigation/states/selectors/lastVisitedObjectMetadataItemIdStateSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLastVisitedObjectMetadataItem = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const scopeId = currentWorkspace?.id ?? '';

  const lastVisitedObjectMetadataItemIdState = extractComponentState(
    lastVisitedObjectMetadataItemIdStateSelector,
    scopeId,
  );

  const [lastVisitedObjectMetadataItemId, setLastVisitedObjectMetadataItemId] =
    useRecoilState(lastVisitedObjectMetadataItemIdState);

  const {
    findActiveObjectMetadataItemBySlug,
    alphaSortedActiveObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const setFallbackForLastVisitedObjectMetadataItem = (
    objectMetadataItemId: string,
  ) => {
    const isDeactivateDefault = isDeeplyEqual(
      lastVisitedObjectMetadataItemId,
      objectMetadataItemId,
    );

    const [newFallbackObjectMetadataItem] =
      alphaSortedActiveObjectMetadataItems.filter(
        (item) => item.id !== objectMetadataItemId,
      );

    if (isDeactivateDefault) {
      setLastVisitedObjectMetadataItemId(newFallbackObjectMetadataItem.id);
      setNavigationMemorizedUrl(
        `/objects/${newFallbackObjectMetadataItem.namePlural}`,
      );
    }
  };

  const setLastVisitedObjectMetadataItem = (objectNamePlural: string) => {
    const fallbackObjectMetadataItem =
      findActiveObjectMetadataItemBySlug(objectNamePlural);

    if (isDefined(fallbackObjectMetadataItem)) {
      setLastVisitedObjectMetadataItemId(fallbackObjectMetadataItem.id);
    }
  };

  return {
    lastVisitedObjectMetadataItemId,
    setLastVisitedObjectMetadataItem,
    setFallbackForLastVisitedObjectMetadataItem,
  };
};
