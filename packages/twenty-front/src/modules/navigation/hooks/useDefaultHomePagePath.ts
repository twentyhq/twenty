import { currentUserState } from '@/auth/states/currentUserState';
import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { arePrefetchViewsLoadedState } from '@/prefetch/states/arePrefetchViewsLoaded';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import isEmpty from 'lodash.isempty';
import { useCallback, useMemo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { getAppPath } from '~/utils/navigation/getAppPath';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const {
    activeNonSystemObjectMetadataItems,
    alphaSortedActiveNonSystemObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const arePrefetchViewsLoaded = useRecoilValue(arePrefetchViewsLoadedState);

  const readableAlphaSortedActiveNonSystemObjectMetadataItems = useMemo(() => {
    return alphaSortedActiveNonSystemObjectMetadataItems.filter((item) => {
      const objectPermissions = objectPermissionsByObjectMetadataId[item.id];
      return objectPermissions?.canReadObjectRecords;
    });
  }, [
    alphaSortedActiveNonSystemObjectMetadataItems,
    objectPermissionsByObjectMetadataId,
  ]);

  const getActiveObjectMetadataItemMatchingId = useCallback(
    (objectMetadataId: string) => {
      return activeNonSystemObjectMetadataItems.find(
        (item) => item.id === objectMetadataId,
      );
    },
    [activeNonSystemObjectMetadataItems],
  );

  const getFirstView = useRecoilCallback(
    ({ snapshot }) => {
      return (objectMetadataItemId: string | undefined | null) => {
        if (!arePrefetchViewsLoaded) {
          return undefined;
        }

        const views = snapshot.getLoadable(prefetchViewsState).getValue();

        return views.find(
          (view) => view.objectMetadataId === objectMetadataItemId,
        );
      };
    },
    [arePrefetchViewsLoaded],
  );

  const firstObjectPathInfo = useMemo<ObjectPathInfo | null>(() => {
    const [firstObjectMetadataItem] =
      readableAlphaSortedActiveNonSystemObjectMetadataItems;

    if (!isDefined(firstObjectMetadataItem)) {
      return null;
    }

    const view = getFirstView(firstObjectMetadataItem?.id);

    return { objectMetadataItem: firstObjectMetadataItem, view };
  }, [getFirstView, readableAlphaSortedActiveNonSystemObjectMetadataItems]);

  const getDefaultObjectPathInfo = useRecoilCallback(
    ({ snapshot }) => {
      return () => {
        const lastVisitedObjectMetadataItemId = snapshot
          .getLoadable(lastVisitedObjectMetadataItemIdState)
          .getValue();

        if (
          !isDefined(lastVisitedObjectMetadataItemId) ||
          !objectPermissionsByObjectMetadataId[lastVisitedObjectMetadataItemId]
            ?.canReadObjectRecords
        ) {
          return firstObjectPathInfo;
        }

        const lastVisitedObjectMetadataItem =
          getActiveObjectMetadataItemMatchingId(
            lastVisitedObjectMetadataItemId,
          );

        if (isDefined(lastVisitedObjectMetadataItem)) {
          return {
            view: getFirstView(lastVisitedObjectMetadataItemId),
            objectMetadataItem: lastVisitedObjectMetadataItem,
          };
        }

        return firstObjectPathInfo;
      };
    },
    [
      firstObjectPathInfo,
      getActiveObjectMetadataItemMatchingId,
      getFirstView,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const defaultHomePagePath = useMemo(() => {
    if (!arePrefetchViewsLoaded) {
      return undefined;
    }

    if (!isDefined(currentUser)) {
      return AppPath.SignInUp;
    }

    if (isEmpty(readableAlphaSortedActiveNonSystemObjectMetadataItems)) {
      return `${AppPath.Settings}/${SettingsPath.ProfilePage}`;
    }

    const defaultObjectPathInfo = getDefaultObjectPathInfo();

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
  }, [
    arePrefetchViewsLoaded,
    currentUser,
    getDefaultObjectPathInfo,
    readableAlphaSortedActiveNonSystemObjectMetadataItems,
  ]);

  return { defaultHomePagePath };
};
