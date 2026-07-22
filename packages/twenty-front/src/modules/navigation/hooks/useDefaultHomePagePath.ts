import { currentUserState } from '@/auth/states/currentUserState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { type ObjectPathInfo } from '@/navigation/types/ObjectPathInfo';
import { getFirstNavigationMenuItemLink } from '@/navigation/utils/getFirstNavigationMenuItemLink';
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
  const navigationMenuItemsInDisplayOrder = useNavigationMenuItemSectionItems();

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

  const firstNavigationMenuItemLink = useMemo(
    () =>
      getFirstNavigationMenuItemLink({
        navigationMenuItemsInDisplayOrder,
        objectMetadataItems,
        views,
        objectPermissionsByObjectMetadataId,
      }),
    [
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      views,
      navigationMenuItemsInDisplayOrder,
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

    // While metadata is loading the store can look empty; concluding the
    // /settings/profile empty-workspace fallback from that transient state
    // would strand the user there. AppPath.Index self-heals once loaded.
    if (!areObjectMetadataItemsLoaded || !areNavigationMenuItemsLoaded) {
      return AppPath.Index;
    }

    if (isEmpty(readableNonSystemObjectMetadataItems)) {
      return getSettingsPath(SettingsPath.ProfilePage);
    }

    if (isDefined(firstNavigationMenuItemLink)) {
      return firstNavigationMenuItemLink;
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
    firstNavigationMenuItemLink,
    firstObjectPathInfo,
  ]);

  return { defaultHomePagePath };
};
