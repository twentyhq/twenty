import { currentUserState } from '@/auth/states/currentUserState';
import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { View } from '@/views/types/View';
import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { getAppPath } from '~/utils/navigation/getAppPath';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { activeObjectMetadataItems, alphaSortedActiveObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const { lastVisitedObjectMetadataItemId } =
    useLastVisitedObjectMetadataItem();

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
      views.find((view) => view.objectMetadataId === objectMetadataItemId),
    [views],
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
