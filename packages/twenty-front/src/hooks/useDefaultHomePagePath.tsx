import { currentUserState } from '@/auth/states/currentUserState';
import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { isNull, isUndefined } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { activeObjectMetadataItems, alphaSortedActiveObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { records: views } = usePrefetchedData(PrefetchKey.AllViews);
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

  const getViewMatchingObjectMetdataItemId = useCallback(
    (objectMetadataId: string) =>
      views.find((view: any) => view?.objectMetadataId === objectMetadataId),
    [views],
  );

  const getFirstObjectInfo = useCallback(() => {
    const [firstObjectMetadataItem] = alphaSortedActiveObjectMetadataItems;
    const view = getViewMatchingObjectMetdataItemId(firstObjectMetadataItem.id);
    return { objectMetadataItem: firstObjectMetadataItem, view };
  }, [
    alphaSortedActiveObjectMetadataItems,
    getViewMatchingObjectMetdataItemId,
  ]);

  const defaultHomePagePath = useMemo(() => {
    if (!isDefined(currentUser)) {
      return AppPath.SignInUp;
    }

    const { view, objectMetadataItem } = !isNull(
      lastVisitedObjectMetadataItemId,
    ) // last visited page exist in localstorage
      ? (() => {
          const lastVisitedObjectMetadataItem =
            getActiveObjectMetadataItemMatchingId(
              lastVisitedObjectMetadataItemId,
            );
          // and last visited page is still active
          if (!isUndefined(lastVisitedObjectMetadataItem)) {
            return {
              view: getViewMatchingObjectMetdataItemId(
                lastVisitedObjectMetadataItemId,
              ),
              objectMetadataItem: lastVisitedObjectMetadataItem,
            };
          }
          // if not fallback to alphabetically first
          return getFirstObjectInfo();
        })()
      : getFirstObjectInfo();

    return `/objects/${objectMetadataItem.namePlural}${view ? `?view=${view.id}` : ''}`;
  }, [
    currentUser,
    lastVisitedObjectMetadataItemId,
    getFirstObjectInfo,
    getActiveObjectMetadataItemMatchingId,
    getViewMatchingObjectMetdataItemId,
  ]);

  return { defaultHomePagePath };
};
