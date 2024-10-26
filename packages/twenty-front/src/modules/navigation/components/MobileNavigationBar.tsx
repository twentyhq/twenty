import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { useFilteredObjectMetadataItemsForWorkspaceFavorites } from '@/navigation/hooks/useObjectMetadataItemsInWorkspaceFavorites';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { View } from '@/views/types/View';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AvatarType, IconComponent, NavigationBar, useIcons } from 'twenty-ui';
import { useIsSettingsPage } from '../hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '../states/currentMobileNavigationDrawerState';

type NavigationBarItemName = 'main' | 'search' | 'tasks' | 'settings';

export const MobileNavigationBar = () => {
  const [isCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const { closeCommandMenu, openCommandMenu } = useCommandMenu();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const [currentMobileNavigationDrawer, setCurrentMobileNavigationDrawer] =
    useRecoilState(currentMobileNavigationDrawerState);
  const { favorites, handleReorderFavorite } = useFavorites();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const navigate = useNavigate();
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const { getLastVisitedViewIdFromObjectMetadataItemId } = useLastVisitedView();
  const { getIcon } = useIcons();

  const activeItemName = isNavigationDrawerExpanded
    ? currentMobileNavigationDrawer
    : isCommandMenuOpened
      ? 'search'
      : isSettingsPage
        ? 'settings'
        : 'main';

  const currentWorkspaceMemberFavorites = favorites.filter(
    (favorite) => favorite.workspaceMemberId === currentWorkspaceMember?.id,
  );

  const favoriteItems: {
    id: string;
    name: string;
    labelIdentifier: string;
    avatarUrl: string;
    avatarType: AvatarType;
    link: string;
    recordId: string;
    onClick: () => void;
  }[] = currentWorkspaceMemberFavorites.map((favItem) => ({
    id: favItem.id,
    name: favItem.labelIdentifier,
    labelIdentifier: favItem.labelIdentifier,
    avatarUrl: favItem.avatarUrl,
    avatarType: favItem.avatarType,
    link: favItem.link,
    recordId: favItem.recordId,
    onClick: () => navigate(favItem.link),
  }));

  const ORDERED_STANDARD_OBJECTS = [
    'person',
    'company',
    'opportunity',
    'task',
    'note',
  ];

  const { activeObjectMetadataItems: objectMetadataItemsToDisplay } =
    useFilteredObjectMetadataItemsForWorkspaceFavorites();

  const sortedStandardObjectMetadataItems = [...objectMetadataItemsToDisplay]
    .filter((item) => ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      const indexA = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemA.nameSingular,
      );
      const indexB = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemB.nameSingular,
      );
      if (indexA === -1 || indexB === -1) {
        return objectMetadataItemA.nameSingular.localeCompare(
          objectMetadataItemB.nameSingular,
        );
      }
      return indexA - indexB;
    });

  const sortedCustomObjectMetadataItems = [...objectMetadataItemsToDisplay]
    .filter((item) => !ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      return new Date(objectMetadataItemA.createdAt) <
        new Date(objectMetadataItemB.createdAt)
        ? 1
        : -1;
    });

  const objectMetadataItemsForNavigationItems: {
    id: string;
    Icon: IconComponent;
    isActive: boolean;
    onclick: () => void;
  }[] = [
    ...sortedStandardObjectMetadataItems,
    ...sortedCustomObjectMetadataItems,
  ].map((objectMetadata) => {
    const objectMetadataViews = getObjectMetadataItemViews(
      objectMetadata.id,
      views,
    );
    const lastVisitedViewId = getLastVisitedViewIdFromObjectMetadataItemId(
      objectMetadata.id,
    );
    const viewId = lastVisitedViewId ?? objectMetadataViews[0]?.id;
    const navigationPath = `/objects/${objectMetadata.namePlural}${
      viewId ? `?view=${viewId}` : ''
    }`;

    return {
      id: objectMetadata.id,
      Icon: getIcon(objectMetadata.icon),
      isActive: objectMetadata.id == viewId,
      onclick: () => navigate(navigationPath),
    };
  });

  return (
    <NavigationBar
      activeItemName={activeItemName}
      favorites={favoriteItems}
      objectMetaData={objectMetadataItemsForNavigationItems}
    />
  );
};
