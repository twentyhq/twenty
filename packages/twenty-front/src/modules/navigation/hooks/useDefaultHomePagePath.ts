import { currentUserState } from '@/auth/states/currentUserState';
import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { AppPath } from '@/types/AppPath';
import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { getAppPath } from '~/utils/navigation/getAppPath';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { activeObjectMetadataItems, alphaSortedActiveObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const prefetchViews = useRecoilValue(prefetchViewsState);
  const lastVisitedObjectMetadataItemId = useRecoilValue(
    lastVisitedObjectMetadataItemIdState,
  );

  const getActiveObjectMetadataItemMatchingId = useCallback(
    (objectMetadataId: string) => {
      return activeObjectMetadataItems.find(
        (item) => item.id === objectMetadataId,
      );
    },
    [activeObjectMetadataItems],
  );

  const getFirstView = useCallback(
    (objectMetadataItemId: string | undefined | null) =>
      prefetchViews.find(
        (view) => view.objectMetadataId === objectMetadataItemId,
      ),
    [prefetchViews],
  );

  const firstObjectPathInfo = useMemo<ObjectPathInfo | null>(() => {
    const [firstObjectMetadataItem] = alphaSortedActiveObjectMetadataItems;

    if (!isDefined(firstObjectMetadataItem)) {
      return null;
    }

    const view = getFirstView(firstObjectMetadataItem?.id);

    return { objectMetadataItem: firstObjectMetadataItem, view };
  }, [alphaSortedActiveObjectMetadataItems, getFirstView]);

  const defaultObjectPathInfo = useMemo<ObjectPathInfo | null>(() => {
    if (!isDefined(lastVisitedObjectMetadataItemId)) {
      return firstObjectPathInfo;
    }

    const lastVisitedObjectMetadataItem = getActiveObjectMetadataItemMatchingId(
      lastVisitedObjectMetadataItemId,
    );

    if (isDefined(lastVisitedObjectMetadataItem)) {
      return {
        view: getFirstView(lastVisitedObjectMetadataItemId),
        objectMetadataItem: lastVisitedObjectMetadataItem,
      };
    }

    return firstObjectPathInfo;
  }, [
    firstObjectPathInfo,
    getActiveObjectMetadataItemMatchingId,
    getFirstView,
    lastVisitedObjectMetadataItemId,
  ]);

  const defaultHomePagePath = useMemo(() => {
    if (!isDefined(currentUser)) {
      return AppPath.SignInUp;
    }

    if (!isDefined(defaultObjectPathInfo)) {
      return AppPath.NotFound;
    }

    const namePlural = defaultObjectPathInfo.objectMetadataItem?.namePlural;
    const viewId = defaultObjectPathInfo.view?.id;

    return getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: namePlural },
      viewId ? { viewId } : undefined,
    );
  }, [currentUser, defaultObjectPathInfo]);

  return { defaultHomePagePath };
};
