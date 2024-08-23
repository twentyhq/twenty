import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { isNull, isUndefined } from '@sniptt/guards';
import { isDefined } from '~/utils/isDefined';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { activeObjectMetadataItems, alphaSortedActiveObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { records: views } = usePrefetchedData(PrefetchKey.AllViews);
  const { lastVisitedObjectMetadataItemId } =
    useLastVisitedObjectMetadataItem();
  let objectMetadata: {
    view?: ObjectRecord;
    metadata: ObjectMetadataItem;
  };

  if (!isDefined(currentUser)) {
    return { defaultHomePagePath: AppPath.SignInUp };
  }

  const getActiveObjectMetadataItemMatchingId = (objectMetadataId: string) => {
    return activeObjectMetadataItems.find(
      (item) => item.id === objectMetadataId,
    );
  };

  const getFirstObjectInfo = () => {
    const [firstObjectMetadataItem] = alphaSortedActiveObjectMetadataItems;

    const view = getViewMatchingObjectMetdataItemId(firstObjectMetadataItem.id);
    return { metadata: firstObjectMetadataItem, view };
  };

  const getViewMatchingObjectMetdataItemId = (objectMetadataId: string) =>
    views.find((view: any) => view?.objectMetadataId === objectMetadataId);

  // last visited page exist in localstorage
  if (!isNull(lastVisitedObjectMetadataItemId)) {
    const lastVisitedObjectMetadataItem = getActiveObjectMetadataItemMatchingId(
      lastVisitedObjectMetadataItemId,
    );

    // and last visited page is still active
    if (!isUndefined(lastVisitedObjectMetadataItem)) {
      objectMetadata = {
        view: getViewMatchingObjectMetdataItemId(
          lastVisitedObjectMetadataItemId,
        ),
        metadata: lastVisitedObjectMetadataItem,
      };
    } else {
      // if not fallback to alphabetically first
      objectMetadata = getFirstObjectInfo();
    }
  } else {
    objectMetadata = getFirstObjectInfo();
  }

  const { view, metadata } = objectMetadata;

  return {
    defaultHomePagePath: `/objects/${metadata.namePlural}${view ? `?view=${view?.id}` : ''}`,
  };
};
