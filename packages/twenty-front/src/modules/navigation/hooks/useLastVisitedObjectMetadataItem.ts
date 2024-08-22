import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { lastVisitedObjectMetadataItemStateSelector } from '@/navigation/states/selectors/lastVisitedObjectMetadataItemStateSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLastVisitedObjectMetadataItem = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const scopeId = currentWorkspace?.id ?? '';

  const lastVisitedObjectMetadataItemState = extractComponentState(
    lastVisitedObjectMetadataItemStateSelector,
    scopeId,
  );

  const [lastVisitedObjectMetadataItem, setLastVisitedObjectMetadataItem] =
    useRecoilState(lastVisitedObjectMetadataItemState);

  const {
    findActiveObjectMetadataItemBySlug,
    alphaSortedActiveObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const lastVisitedObjectMetadataItemId = lastVisitedObjectMetadataItem ?? null;

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
      setLastVisitedObjectMetadataItem(newFallbackObjectMetadataItem.id);
      setNavigationMemorizedUrl(
        `/objects/${newFallbackObjectMetadataItem.namePlural}`,
      );
    }
  };

  const setLastVisitedObjectMetadataItemForPluralName = (
    objectNamePlural: string,
  ) => {
    const fallbackObjectMetadataItemId =
      findActiveObjectMetadataItemBySlug(objectNamePlural)?.id ?? '';

    setLastVisitedObjectMetadataItem(fallbackObjectMetadataItemId);
  };

  return {
    lastVisitedObjectMetadataItemId,
    setLastVisitedObjectMetadataItemForPluralName,
    setFallbackForLastVisitedObjectMetadataItem,
  };
};
