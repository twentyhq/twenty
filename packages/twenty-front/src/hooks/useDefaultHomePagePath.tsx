import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLastVisitedPage } from '@/navigation/hooks/useLastVisitedPage';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { isDefined } from '~/utils/isDefined';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { records } = usePrefetchedData(PrefetchKey.AllViews);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { lastVisitedObjectMetadataId } = useLastVisitedPage(
    currentWorkspace?.id ?? '',
  );
  let objectMetadata: {
    view?: ObjectRecord;
    metadata: ObjectMetadataItem;
  };

  if (!isDefined(currentUser)) {
    return { defaultHomePagePath: AppPath.SignInUp };
  }

  const getObjectMetadataMatchingId = (objectMetadataId: string) => {
    return activeObjectMetadataItems.find(
      (item) => item.id === objectMetadataId,
    );
  };

  const getFirstObjectInfo = () => {
    const [metadata] = activeObjectMetadataItems.sort((a, b) => {
      if (a.nameSingular < b.nameSingular) {
        return -1;
      }
      if (a.nameSingular > b.nameSingular) {
        return 1;
      }
      return 0;
    });

    const view = getViewMatchingObjectId(metadata.id);
    return { metadata, view };
  };

  const getViewMatchingObjectId = (objectMetadataId: string) =>
    records.find((view: any) => view?.objectMetadataId === objectMetadataId);

  // last visited page exist in localstorage
  if (lastVisitedObjectMetadataId !== null) {
    const lastVisitedMetadata = getObjectMetadataMatchingId(
      lastVisitedObjectMetadataId,
    );

    // and last visited page is still active
    if (lastVisitedMetadata !== undefined) {
      objectMetadata = {
        view: getViewMatchingObjectId(lastVisitedObjectMetadataId),
        metadata: lastVisitedMetadata,
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
