import { currentUserState } from '@/auth/states/currentUserState';
import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { type ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import isEmpty from 'lodash.isempty';
import { useCallback, useMemo } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useDefaultHomePagePath = () => {
  const store = useStore();
  const currentUser = useAtomStateValue(currentUserState);

  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  const readableNonSystemObjectMetadataItems = useMemo(
    () =>
      readableObjectMetadataItems
        .filter((item) => !item.isSystem)
        .sort((a, b) => a.nameSingular.localeCompare(b.nameSingular)),
    [readableObjectMetadataItems],
  );

  const getActiveObjectMetadataItemMatchingId = useCallback(
    (objectMetadataId: string) => {
      return readableNonSystemObjectMetadataItems.find(
        (item) => item.id === objectMetadataId,
      );
    },
    [readableNonSystemObjectMetadataItems],
  );

  const views = useAtomStateValue(viewsSelector);

  const getFirstView = useCallback(
    (objectMetadataItemId: string | undefined | null) => {
      return views.find(
        (view) => view.objectMetadataId === objectMetadataItemId,
      );
    },
    [views],
  );

  const firstObjectPathInfo = useMemo<ObjectPathInfo | null>(() => {
    const [firstObjectMetadataItem] = readableNonSystemObjectMetadataItems;

    if (!isDefined(firstObjectMetadataItem)) {
      return null;
    }

    const view = getFirstView(firstObjectMetadataItem?.id);

    return { objectMetadataItem: firstObjectMetadataItem, view };
  }, [getFirstView, readableNonSystemObjectMetadataItems]);

  const getDefaultObjectPathInfo = useCallback(() => {
    const lastVisitedObjectMetadataItemId = store.get(
      lastVisitedObjectMetadataItemIdState.atom,
    );

    const lastVisitedObjectMetadataItem = isDefined(
      lastVisitedObjectMetadataItemId,
    )
      ? getActiveObjectMetadataItemMatchingId(lastVisitedObjectMetadataItemId)
      : undefined;

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
    store,
  ]);

  const defaultHomePagePath = useMemo(() => {
    if (!isDefined(currentUser)) {
      return AppPath.SignInUp;
    }

    if (isEmpty(readableNonSystemObjectMetadataItems)) {
      return getSettingsPath(SettingsPath.ProfilePage);
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
    currentUser,
    getDefaultObjectPathInfo,
    readableNonSystemObjectMetadataItems,
  ]);

  return { defaultHomePagePath };
};
