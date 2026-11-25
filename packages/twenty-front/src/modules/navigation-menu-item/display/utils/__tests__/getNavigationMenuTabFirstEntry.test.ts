import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { type NavigationMenuTabEntry } from '@/navigation-menu-item/common/types/NavigationMenuTabEntry';
import { getNavigationMenuTabFirstEntry } from '@/navigation-menu-item/display/utils/getNavigationMenuTabFirstEntry';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const TAB_ID = 'tab-id';

const buildItem = (
  properties: Pick<NavigationMenuItem, 'id' | 'type' | 'position'> &
    Partial<NavigationMenuItem>,
): NavigationMenuItem => ({
  isActive: true,
  createdAt: '2026-11-25T00:00:00.000Z',
  updatedAt: '2026-11-25T00:00:00.000Z',
  parentId: TAB_ID,
  ...properties,
});

const buildPageLayoutItem = (
  id: string,
  position: number,
  parentId: string | null = TAB_ID,
) =>
  buildItem({
    id,
    type: NavigationMenuItemType.PAGE_LAYOUT,
    position,
    parentId,
    pageLayoutId: `${id}-layout`,
  });

const getPageLayoutLink = (id: string) =>
  getAppPath(AppPath.PageLayoutPage, { pageLayoutId: `${id}-layout` });

const getFirstEntry = ({
  workspaceItems,
  favoriteItems = [],
  permissionFlagMap = {},
  getBuiltInSectionEntry = () => null,
}: {
  workspaceItems: NavigationMenuItem[];
  favoriteItems?: NavigationMenuItem[];
  permissionFlagMap?: Partial<Record<PermissionFlagType, boolean>>;
  getBuiltInSectionEntry?: (
    builtInSectionKey: string,
  ) => NavigationMenuTabEntry | null;
}) =>
  getNavigationMenuTabFirstEntry({
    tabId: TAB_ID,
    workspaceNavigationMenuItems: workspaceItems,
    workspaceNavigationMenuItemsSorted: workspaceItems,
    workspaceNavigationMenuItemsByFolder: workspaceItems
      .filter(({ type }) => type === NavigationMenuItemType.FOLDER)
      .map((folder) => ({
        id: folder.id,
        navigationMenuItems: workspaceItems.filter(
          ({ parentId }) => parentId === folder.id,
        ),
      })),
    favoriteNavigationMenuItems: favoriteItems,
    favoriteNavigationMenuItemsByFolder: [],
    objectMetadataItems: [],
    views: [],
    objectPermissionsByObjectMetadataId: {},
    permissionFlagMap,
    getBuiltInSectionEntry,
  });

describe('getNavigationMenuTabFirstEntry', () => {
  it('opens the loose item placed before the sections', () => {
    const section = buildItem({
      id: 'section',
      type: NavigationMenuItemType.SECTION,
      position: 1,
      name: 'Section',
    });

    expect(
      getFirstEntry({
        workspaceItems: [
          section,
          buildPageLayoutItem('section-item', 0, section.id),
          buildPageLayoutItem('loose-item', 0),
        ],
      }),
    ).toEqual({ type: 'link', link: getPageLayoutLink('loose-item') });
  });

  it('opens the first item of a section placed before the loose items', () => {
    const section = buildItem({
      id: 'section',
      type: NavigationMenuItemType.SECTION,
      position: 0,
      name: 'Section',
    });

    expect(
      getFirstEntry({
        workspaceItems: [
          buildPageLayoutItem('loose-item', 1),
          section,
          buildPageLayoutItem('second-section-item', 1, section.id),
          buildPageLayoutItem('first-section-item', 0, section.id),
        ],
      }),
    ).toEqual({ type: 'link', link: getPageLayoutLink('first-section-item') });
  });

  it('skips external links and items the member cannot read', () => {
    expect(
      getFirstEntry({
        workspaceItems: [
          buildItem({
            id: 'external-link',
            type: NavigationMenuItemType.LINK,
            position: 0,
            link: 'https://example.com',
          }),
          buildItem({
            id: 'workflows',
            type: NavigationMenuItemType.NATIVE_PAGE,
            position: 1,
            nativePageKey: 'workflows',
          }),
          buildPageLayoutItem('readable-item', 2),
        ],
        permissionFlagMap: { [PermissionFlagType.WORKFLOWS]: false },
      }),
    ).toEqual({ type: 'link', link: getPageLayoutLink('readable-item') });
  });

  it('opens a readable native page', () => {
    expect(
      getFirstEntry({
        workspaceItems: [
          buildItem({
            id: 'workflows',
            type: NavigationMenuItemType.NATIVE_PAGE,
            position: 0,
            nativePageKey: 'workflows',
          }),
        ],
        permissionFlagMap: { [PermissionFlagType.WORKFLOWS]: true },
      }),
    ).toEqual({
      type: 'link',
      link: getAppPath(AppPath.WorkflowIndexPage),
    });
  });

  it('opens the first child of a folder', () => {
    const folder = buildItem({
      id: 'folder',
      type: NavigationMenuItemType.FOLDER,
      position: 0,
      name: 'Folder',
    });

    expect(
      getFirstEntry({
        workspaceItems: [
          buildPageLayoutItem('loose-item', 1),
          folder,
          buildPageLayoutItem('folder-child', 0, folder.id),
        ],
      }),
    ).toEqual({ type: 'link', link: getPageLayoutLink('folder-child') });
  });

  it('opens the entry of a built-in section and skips empty ones', () => {
    const channelEntry: NavigationMenuTabEntry = {
      type: 'inboxChannel',
      channelId: 'channel-id',
    };

    expect(
      getFirstEntry({
        workspaceItems: [
          buildItem({
            id: 'favorite-chats',
            type: NavigationMenuItemType.SECTION,
            position: 0,
            builtInSectionKey: 'aiChatFavorites',
          }),
          buildItem({
            id: 'channels',
            type: NavigationMenuItemType.SECTION,
            position: 1,
            builtInSectionKey: 'aiChatChannels',
          }),
          buildPageLayoutItem('loose-item', 2),
        ],
        getBuiltInSectionEntry: (builtInSectionKey) =>
          builtInSectionKey === 'aiChatChannels' ? channelEntry : null,
      }),
    ).toEqual(channelEntry);
  });

  it('opens the first readable favorite for the favorites section', () => {
    expect(
      getFirstEntry({
        workspaceItems: [
          buildItem({
            id: 'favorites',
            type: NavigationMenuItemType.SECTION,
            position: 0,
            builtInSectionKey: 'favorites',
          }),
          buildPageLayoutItem('loose-item', 1),
        ],
        favoriteItems: [
          buildItem({
            id: 'favorite-link',
            type: NavigationMenuItemType.LINK,
            position: 0,
            parentId: null,
            link: 'https://example.com',
          }),
          buildPageLayoutItem('favorite', 1, null),
        ],
      }),
    ).toEqual({ type: 'link', link: getPageLayoutLink('favorite') });
  });

  it('returns null when the tab has nothing to open', () => {
    expect(
      getFirstEntry({
        workspaceItems: [
          buildPageLayoutItem('other-tab-item', 0, 'other-tab-id'),
          buildItem({
            id: 'external-link',
            type: NavigationMenuItemType.LINK,
            position: 0,
            link: 'https://example.com',
          }),
          buildItem({
            id: 'channels',
            type: NavigationMenuItemType.SECTION,
            position: 1,
            builtInSectionKey: 'aiChatChannels',
          }),
        ],
      }),
    ).toBeNull();
  });
});
