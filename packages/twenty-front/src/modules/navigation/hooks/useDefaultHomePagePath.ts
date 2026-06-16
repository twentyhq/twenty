import { currentUserState } from '@/auth/states/currentUserState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { type ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { getFirstObjectNavigationMenuItemLink } from '@/navigation/utils/getFirstObjectNavigationMenuItemLink';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import isEmpty from 'lodash.isempty';
import { useCallback, useMemo } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath, isDefined } from 'twenty-shared/utils';

export const useDefaultHomePagePath = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  const areObjectMetadataItemsLoaded = metadataStore.status === 'up-to-date';
  const navigationMenuItemsStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'navigationMenuItems',
  );
  const areNavigationMenuItemsLoaded =
    navigationMenuItemsStatus === 'up-to-date';

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();

  const readableNonSystemObjectMetadataItems = useMemo(
    () =>
      filterReadableActiveObjectMetadataItems(
        activeObjectMetadataItems,
        objectPermissionsByObjectMetadataId,
      )
        .filter((item) => !item.isSystem)
        .sort((a, b) => a.nameSingular.localeCompare(b.nameSingular)),
    [activeObjectMetadataItems, objectPermissionsByObjectMetadataId],
  );

  const getFirstView = useCallback(
    (objectMetadataItemId: string | undefined | null) => {
      return views.find(
        (view) => view.objectMetadataId === objectMetadataItemId,
      );
    },
    [views],
  );

  const firstObjectNavigationMenuItemLink = useMemo(
    () =>
      getFirstObjectNavigationMenuItemLink({
        workspaceNavigationMenuItemsSorted,
        objectMetadataItems,
        views,
        objectPermissionsByObjectMetadataId,
      }),
    [
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      views,
      workspaceNavigationMenuItemsSorted,
    ],
  );

  const firstObjectPathInfo = useMemo<ObjectPathInfo | null>(() => {
    const [firstObjectMetadataItem] = readableNonSystemObjectMetadataItems;

    if (!isDefined(firstObjectMetadataItem)) {
      return null;
    }

    const view = getFirstView(firstObjectMetadataItem.id);

    return { objectMetadataItem: firstObjectMetadataItem, view };
  }, [getFirstView, readableNonSystemObjectMetadataItems]);

  const defaultHomePagePath = useMemo(() => {
    if (!isDefined(currentUser)) {
      return AppPath.SignInUp;
    }

    if (isEmpty(readableNonSystemObjectMetadataItems)) {
      // Object metadata may legitimately be empty for a user with no readable
      // objects, in which case /settings/profile is the intended fallback.
      // It can also be transiently empty during the post-login window before
      // workspace metadata has finished loading. Defer to AppPath.Index in
      // that case so the user isn't stranded on /settings/profile once
      // metadata becomes available.
      if (!areObjectMetadataItemsLoaded) {
        return AppPath.Index;
      }
      return getSettingsPath(SettingsPath.ProfilePage);
    }

    // The navigation menu drives the redirect and loads after the minimal-
    // metadata fast path. Wait for it instead of falling back to the
    // alphabetically-first object during the post-login window.
    if (!areNavigationMenuItemsLoaded) {
      return AppPath.Index;
    }

    if (isDefined(firstObjectNavigationMenuItemLink)) {
      return firstObjectNavigationMenuItemLink;
    }

    if (!isDefined(firstObjectPathInfo)) {
      return AppPath.NotFound;
    }

    return getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: firstObjectPathInfo.objectMetadataItem?.namePlural },
      firstObjectPathInfo.view?.id
        ? { viewId: firstObjectPathInfo.view.id }
        : undefined,
    );
  }, [
    currentUser,
    readableNonSystemObjectMetadataItems,
    areObjectMetadataItemsLoaded,
    areNavigationMenuItemsLoaded,
    firstObjectNavigationMenuItemLink,
    firstObjectPathInfo,
  ]);

  return { defaultHomePagePath };
};
