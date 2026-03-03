import { currentUserState } from '@/auth/states/currentUserState';
import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { type ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import isEmpty from 'lodash.isempty';
import { useCallback, useMemo } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useDefaultHomePagePath = () => {
  const store = useStore();
  const currentUser = useAtomStateValue(currentUserState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const permissionFlagMap = usePermissionFlagMap();
  const isAdmin = permissionFlagMap[PermissionFlagType.LAYOUTS];

  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const readableAlphaSortedActiveNonSystemObjectMetadataItems = useMemo(() => {
    return alphaSortedActiveNonSystemObjectMetadataItems.filter((item) => {
      const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId,
        objectMetadataId: item.id,
      });
      return objectPermissions?.canReadObjectRecords;
    });
  }, [
    alphaSortedActiveNonSystemObjectMetadataItems,
    objectPermissionsByObjectMetadataId,
  ]);

  const getActiveObjectMetadataItemMatchingId = useCallback(
    (objectMetadataId: string) => {
      return readableAlphaSortedActiveNonSystemObjectMetadataItems.find(
        (item) => item.id === objectMetadataId,
      );
    },
    [readableAlphaSortedActiveNonSystemObjectMetadataItems],
  );

  const coreViews = useAtomStateValue(coreViewsState);

  const getFirstView = useCallback(
    (objectMetadataItemId: string | undefined | null) => {
      const views = coreViews.map(convertCoreViewToView);

      return views.find(
        (view) => view.objectMetadataId === objectMetadataItemId,
      );
    },
    [coreViews],
  );

  const firstObjectPathInfo = useMemo<ObjectPathInfo | null>(() => {
    // For non-admin users, prefer "person" (Leads) over alphabetical first
    const preferredItem = !isAdmin
      ? readableAlphaSortedActiveNonSystemObjectMetadataItems.find(
          (item) => item.nameSingular === 'person',
        )
      : undefined;

    const targetItem =
      preferredItem ?? readableAlphaSortedActiveNonSystemObjectMetadataItems[0];

    if (!isDefined(targetItem)) {
      return null;
    }

    const view = getFirstView(targetItem.id);

    return { objectMetadataItem: targetItem, view };
  }, [
    getFirstView,
    isAdmin,
    readableAlphaSortedActiveNonSystemObjectMetadataItems,
  ]);

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

    if (isEmpty(readableAlphaSortedActiveNonSystemObjectMetadataItems)) {
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
    readableAlphaSortedActiveNonSystemObjectMetadataItems,
  ]);

  return { defaultHomePagePath };
};
