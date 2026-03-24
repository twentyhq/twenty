import { currentUserState } from '@/auth/states/currentUserState';
import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { type ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
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

  // For non-layout users, filter to only objects visible in sidebar,
  // sorted to match sidebar display order (ORDERED_FIRST_STANDARD_OBJECTS).
  const sidebarVisibleObjectMetadataItems = useMemo(() => {
    if (isAdmin) return readableAlphaSortedActiveNonSystemObjectMetadataItems;
    const SIDEBAR_ORDER = ['person', 'policy', 'company', 'opportunity', 'note', 'task'];
    return readableAlphaSortedActiveNonSystemObjectMetadataItems
      .filter((item) => {
        const objectPermissions =
          getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: item.id,
          });
        return objectPermissions?.showInSidebar;
      })
      .sort((a, b) => {
        const indexA = SIDEBAR_ORDER.indexOf(a.nameSingular);
        const indexB = SIDEBAR_ORDER.indexOf(b.nameSingular);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.nameSingular.localeCompare(b.nameSingular);
      });
  }, [
    isAdmin,
    readableAlphaSortedActiveNonSystemObjectMetadataItems,
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

  // OMNIA-CUSTOM: Use workspace sidebar navigation items as the source of
  // truth for valid landing pages, instead of alphabetical metadata sort.
  // This prevents admins from landing on objects that are active in metadata
  // but not present in their sidebar (e.g. Companies).
  const allNavigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);

  // Build the set of objectMetadataIds that appear in the workspace sidebar
  // (items without userWorkspaceId are workspace-level, not user-pinned).
  const sidebarObjectMetadataIds = useMemo(() => {
    const workspaceItems = allNavigationMenuItems.filter(
      (item) => !isDefined(item.userWorkspaceId),
    );

    const ids: string[] = [];
    for (const item of workspaceItems) {
      if (isDefined(item.viewId)) {
        const view = views.find((v) => v.id === item.viewId);
        if (view) ids.push(view.objectMetadataId);
      } else if (isDefined(item.targetObjectMetadataId)) {
        ids.push(item.targetObjectMetadataId);
      }
    }
    return ids;
  }, [allNavigationMenuItems, views]);

  // For the default landing page, find the first object visible in the sidebar.
  // Admins: first root-level workspace nav item (sorted by position).
  // Non-layout users: first sidebar-visible object (sorted by ORDERED_FIRST_STANDARD_OBJECTS).
  const firstObjectPathInfo = useMemo<ObjectPathInfo | null>(() => {
    // Non-layout users: use the first sidebar-visible object
    if (!isAdmin && sidebarVisibleObjectMetadataItems.length > 0) {
      const firstItem = sidebarVisibleObjectMetadataItems[0];

      return {
        objectMetadataItem: firstItem,
        view: getFirstView(firstItem.id),
      };
    }

    // Admins: use workspace navigation menu items
    const rootWorkspaceItems = allNavigationMenuItems
      .filter(
        (item) =>
          !isDefined(item.userWorkspaceId) && !isDefined(item.folderId),
      )
      .sort((a, b) => a.position - b.position);

    for (const navItem of rootWorkspaceItems) {
      let objectMetadataId: string | undefined;

      if (isDefined(navItem.viewId)) {
        const view = views.find((v) => v.id === navItem.viewId);
        if (view) objectMetadataId = view.objectMetadataId;
      } else if (isDefined(navItem.targetObjectMetadataId)) {
        objectMetadataId = navItem.targetObjectMetadataId;
      }

      if (isDefined(objectMetadataId)) {
        const item = getActiveObjectMetadataItemMatchingId(objectMetadataId);
        if (isDefined(item)) {
          return { objectMetadataItem: item, view: getFirstView(item.id) };
        }
      }
    }

    // Ultimate fallback
    const fallbackItem =
      readableAlphaSortedActiveNonSystemObjectMetadataItems[0];

    return fallbackItem
      ? {
          objectMetadataItem: fallbackItem,
          view: getFirstView(fallbackItem.id),
        }
      : null;
  }, [
    isAdmin,
    allNavigationMenuItems,
    views,
    getActiveObjectMetadataItemMatchingId,
    getFirstView,
    readableAlphaSortedActiveNonSystemObjectMetadataItems,
    sidebarVisibleObjectMetadataItems,
  ]);

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

      // Only honour last-visited if the object is in the workspace sidebar
      if (
        isDefined(lastVisitedObjectMetadataItem) &&
        sidebarObjectMetadataIds.includes(lastVisitedObjectMetadataItem.id)
      ) {
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
    sidebarObjectMetadataIds,
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
