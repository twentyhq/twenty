import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement, useEffect, type ReactNode } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  NavigationMenuItemType,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const Wrapper = ({ children }: { children: ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const buildObjectNavigationMenuItem = (
  objectNameSingular: string,
  position: number,
  folderId?: string,
): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  id: `navigation-menu-item-${objectNameSingular}`,
  type: NavigationMenuItemType.OBJECT,
  targetObjectMetadataId:
    getMockObjectMetadataItemOrThrow(objectNameSingular).id,
  position,
  folderId,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const buildFolderNavigationMenuItem = (
  id: string,
  position: number,
): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  id,
  type: NavigationMenuItemType.FOLDER,
  name: 'Folder',
  position,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const buildViewNavigationMenuItem = (
  viewId: string,
  position: number,
): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  id: `navigation-menu-item-view-${viewId}`,
  type: NavigationMenuItemType.VIEW,
  viewId,
  position,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const renderHooks = ({
  withCurrentUser,
  withExistingView,
  withObjectMetadataLoaded = true,
  objectMetadataItems = getTestEnrichedObjectMetadataItemsMock(),
  navigationMenuItems = [],
  withNavigationMenuItemsLoaded = true,
}: {
  withCurrentUser: boolean;
  withExistingView: boolean;
  withObjectMetadataLoaded?: boolean;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
  navigationMenuItems?: NavigationMenuItem[];
  withNavigationMenuItemsLoaded?: boolean;
}) => {
  if (withObjectMetadataLoaded) {
    setTestObjectMetadataItemsInMetadataStore(jotaiStore, objectMetadataItems);
  } else {
    jotaiStore.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      current: [],
      draft: [],
      status: 'empty',
    });
  }

  jotaiStore.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: navigationMenuItems,
    draft: [],
    status: withNavigationMenuItemsLoaded ? 'up-to-date' : 'empty',
  });

  const { result } = renderHook(
    () => {
      const setCurrentUser = useSetAtomState(currentUserState);
      const setCurrentUserWorkspace = useSetAtomState(
        currentUserWorkspaceState,
      );

      useEffect(() => {
        if (withExistingView) {
          setTestViewsInMetadataStore(jotaiStore, [
            {
              id: 'viewId',
              name: 'Test View',
              objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
              type: ViewType.TABLE,
              key: null,
              isCompact: false,
              openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
              viewFields: [],
              viewFieldGroups: [],
              viewGroups: [],
              viewSorts: [],
              viewFilters: [],
              viewFilterGroups: [],
              kanbanAggregateOperation: AggregateOperations.COUNT,
              icon: '',
              kanbanAggregateOperationFieldMetadataId: '',
              position: 0,
              visibility: ViewVisibility.WORKSPACE,
              createdByUserWorkspaceId: null,
              shouldHideEmptyGroups: false,
              isActive: true,
            },
          ]);
        } else {
          setTestViewsInMetadataStore(jotaiStore, []);
        }

        if (withCurrentUser) {
          setCurrentUser(mockedUserData);
          setCurrentUserWorkspace(mockedUserData.currentUserWorkspace);
        }
      }, [setCurrentUser, setCurrentUserWorkspace]);

      return useDefaultHomePagePath();
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useDefaultHomePagePath', () => {
  it('should return proper path when no currentUser', async () => {
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: false,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
    });
  });
  it('should return proper path when no currentUser and existing view', async () => {
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: true,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
    });
  });
  it('should redirect to the first object of the navigation menu', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
      navigationMenuItems: [
        buildObjectNavigationMenuItem('person', 0),
        buildObjectNavigationMenuItem('company', 1),
      ],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual('/objects/people');
    });
  });
  // Regression: a folder child has a folder-local position starting at 0, so a
  // raw global position sort would hoist it above a top-level item at position
  // 1. The redirect must honor the sidebar display order (top-level items
  // first, folder children nested under their folder), landing on the
  // top-level item.
  it('should honor display order over a lower-positioned item nested in a folder', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
      navigationMenuItems: [
        buildObjectNavigationMenuItem('company', 0, 'folder-1'),
        buildObjectNavigationMenuItem('person', 1),
        buildFolderNavigationMenuItem('folder-1', 2),
      ],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual('/objects/people');
    });
  });
  it('should honor the view of a VIEW navigation menu item', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: true,
      navigationMenuItems: [buildViewNavigationMenuItem('viewId', 0)],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        '/objects/companies?viewId=viewId',
      );
    });
  });
  it('should fall back to the first readable object when the menu has no object item', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
      navigationMenuItems: [],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual('/objects/companies');
    });
  });
  it('should redirect to profile settings when there is no readable object', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
      objectMetadataItems: [],
      navigationMenuItems: [],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        getSettingsPath(SettingsPath.ProfilePage),
      );
    });
  });
  // Regression: during the post-login transition window object metadata may
  // not yet be loaded. We must not redirect the user to /settings/profile
  // (the genuine empty-fallback) until metadata has actually loaded.
  it('should defer to AppPath.Index when currentUser is defined but object metadata is not loaded yet', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
      withObjectMetadataLoaded: false,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.Index);
    });
  });
  it('should defer to AppPath.Index when navigation menu items are not loaded yet', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
      navigationMenuItems: [buildObjectNavigationMenuItem('person', 0)],
      withNavigationMenuItemsLoaded: false,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.Index);
    });
  });
});
