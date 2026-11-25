import { NavigationMenuItemType } from 'twenty-shared/types';

import { hasNavigationMenuContainerVisibleContent } from '@/navigation-menu-item/display/utils/hasNavigationMenuContainerVisibleContent';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const TAB_ID = 'tab';
const READABLE_OBJECT_METADATA_ID = 'readable-object';

const buildItem = (
  overrides: Partial<NavigationMenuItem> &
    Pick<NavigationMenuItem, 'id' | 'type'>,
): NavigationMenuItem => ({
  position: 0,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  parentId: TAB_ID,
  ...overrides,
});

const unreadableObjectItem = (id: string, parentId = TAB_ID) =>
  buildItem({
    id,
    parentId,
    type: NavigationMenuItemType.OBJECT,
    targetObjectMetadataId: 'unreadable-object',
  });

const readableObjectItem = (id: string, parentId = TAB_ID) =>
  buildItem({
    id,
    parentId,
    type: NavigationMenuItemType.OBJECT,
    targetObjectMetadataId: READABLE_OBJECT_METADATA_ID,
  });

const hasVisibleContent = (navigationMenuItems: NavigationMenuItem[]) =>
  hasNavigationMenuContainerVisibleContent({
    containerId: TAB_ID,
    navigationMenuItems,
    isItemReadable: (item) =>
      item.targetObjectMetadataId === READABLE_OBJECT_METADATA_ID,
    isBuiltInSectionAvailable: (builtInSectionKey) =>
      builtInSectionKey === 'favorites',
  });

describe('hasNavigationMenuContainerVisibleContent', () => {
  it('returns false when the container has no children', () => {
    expect(hasVisibleContent([])).toBe(false);
  });

  it('returns false when every item is an unreadable object', () => {
    expect(
      hasVisibleContent([
        unreadableObjectItem('object-1'),
        unreadableObjectItem('object-2'),
      ]),
    ).toBe(false);
  });

  it('returns true when a readable item is nested in a section', () => {
    expect(
      hasVisibleContent([
        buildItem({ id: 'section', type: NavigationMenuItemType.SECTION }),
        readableObjectItem('object', 'section'),
      ]),
    ).toBe(true);
  });

  it('returns false when a folder only holds unreadable items', () => {
    expect(
      hasVisibleContent([
        buildItem({ id: 'folder', type: NavigationMenuItemType.FOLDER }),
        unreadableObjectItem('object', 'folder'),
      ]),
    ).toBe(false);
  });

  it('returns false when every built-in section is unavailable', () => {
    expect(
      hasVisibleContent([
        buildItem({
          id: 'ai-recents',
          type: NavigationMenuItemType.SECTION,
          builtInSectionKey: 'aiChatRecents',
        }),
        buildItem({
          id: 'ai-agents',
          type: NavigationMenuItemType.SECTION,
          builtInSectionKey: 'aiAgents',
        }),
      ]),
    ).toBe(false);
  });

  it('returns true when one readable item sits among unreadable content', () => {
    expect(
      hasVisibleContent([
        unreadableObjectItem('object-1'),
        buildItem({
          id: 'ai-recents',
          type: NavigationMenuItemType.SECTION,
          builtInSectionKey: 'aiChatRecents',
        }),
        buildItem({ id: 'section', type: NavigationMenuItemType.SECTION }),
        buildItem({
          id: 'folder',
          type: NavigationMenuItemType.FOLDER,
          parentId: 'section',
        }),
        unreadableObjectItem('object-2', 'folder'),
        readableObjectItem('object-3', 'folder'),
      ]),
    ).toBe(true);
  });

  it('returns true when an available built-in section is present', () => {
    expect(
      hasVisibleContent([
        unreadableObjectItem('object'),
        buildItem({
          id: 'favorites',
          type: NavigationMenuItemType.SECTION,
          builtInSectionKey: 'favorites',
        }),
      ]),
    ).toBe(true);
  });

  it('ignores items outside the container', () => {
    expect(hasVisibleContent([readableObjectItem('object', 'other-tab')])).toBe(
      false,
    );
  });
});
