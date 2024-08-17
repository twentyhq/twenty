import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { lastVisitedPageOrViewStateSelector } from '@/navigation/states/selectors/lastVisitedPageOrViewStateSelector';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilState, useRecoilValue } from 'recoil';

export const useLastVisitedPage = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const scopeId = currentWorkspace?.id ?? '';
  const currentPagesState = extractComponentState(
    lastVisitedPageOrViewStateSelector,
    scopeId,
  );
  const [currentPages, setCurrentPages] = useRecoilState(currentPagesState);
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const lastVisitedObjectMetadataId = currentPages?.['DEFAULT'] ?? null;

  const setLastVisitedObjectOrView = (
    {
      objectMetadataId,
      viewId,
    }: {
      objectMetadataId: string;
      viewId: string;
    },
    isSlug = false,
  ) => {
    const fallbackObjectMetadataId = isSlug
      ? (findActiveObjectMetadataItemBySlug(objectMetadataId)?.id ?? '')
      : objectMetadataId;
    const fallbackViewId =
      lastVisitedObjectMetadataId === fallbackObjectMetadataId
        ? viewId
        : (currentPages?.[fallbackObjectMetadataId] ?? viewId);

    setCurrentPages({
      DEFAULT: fallbackObjectMetadataId,
      [fallbackObjectMetadataId]: fallbackViewId,
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
    lastVisitedObjectMetadataId,
    setLastVisitedObjectOrView,
    getLastVisitedViewId,
    getLastVisitedViewIdFromObjectId,
  };
};
