import { currentUserState } from '@/auth/states/currentUserState';
import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { type ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
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
    // OMNIA-CUSTOM: Prefer "person" (Leads) as the default landing page for
    // all users. Without this, alphabetical sort lands admins on "company"
    // which is deactivated in our workspace.
    const preferredItem =
      readableAlphaSortedActiveNonSystemObjectMetadataItems.find(
        (item) => item.nameSingular === 'person',
      );

    const targetItem =
      preferredItem ?? readableAlphaSortedActiveNonSystemObjectMetadataItems[0];

    if (!isDefined(targetItem)) {
      return null;
    }

    const view = getFirstView(targetItem.id);

    return { objectMetadataItem: targetItem, view };
  }, [getFirstView, readableAlphaSortedActiveNonSystemObjectMetadataItems]);

  const getDefaultObjectPathInfo = useCallback(() => {
    // Only use last-visited storage for admins; members always land on Leads (People)
    if (isAdmin) {
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
    }

    return firstObjectPathInfo;
  }, [
    firstObjectPathInfo,
    getActiveObjectMetadataItemMatchingId,
    getFirstView,
    isAdmin,
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
