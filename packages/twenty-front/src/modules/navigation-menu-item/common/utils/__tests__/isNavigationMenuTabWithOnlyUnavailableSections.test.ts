import { isNavigationMenuTabWithOnlyUnavailableSections } from '@/navigation-menu-item/common/utils/isNavigationMenuTabWithOnlyUnavailableSections';

const TAB_ID = 'tab-id';
const isBuiltInSectionAvailable = (
  builtInSectionKey: string | null | undefined,
) => builtInSectionKey === 'aiChatRecents';

describe('isNavigationMenuTabWithOnlyUnavailableSections', () => {
  it('is true when every child is an unavailable built-in section', () => {
    expect(
      isNavigationMenuTabWithOnlyUnavailableSections({
        tabId: TAB_ID,
        navigationMenuItems: [
          { parentId: TAB_ID, builtInSectionKey: 'aiChatChannels' },
          { parentId: TAB_ID, builtInSectionKey: 'aiChatInbox' },
          { parentId: null, builtInSectionKey: 'favorites' },
        ],
        isBuiltInSectionAvailable,
      }),
    ).toBe(true);
  });

  it('is false when one built-in section stays available', () => {
    expect(
      isNavigationMenuTabWithOnlyUnavailableSections({
        tabId: TAB_ID,
        navigationMenuItems: [
          { parentId: TAB_ID, builtInSectionKey: 'aiChatChannels' },
          { parentId: TAB_ID, builtInSectionKey: 'aiChatRecents' },
        ],
        isBuiltInSectionAvailable,
      }),
    ).toBe(false);
  });

  it('is false when the tab holds a custom section or an item, or is empty', () => {
    expect(
      isNavigationMenuTabWithOnlyUnavailableSections({
        tabId: TAB_ID,
        navigationMenuItems: [
          { parentId: TAB_ID, builtInSectionKey: 'aiChatChannels' },
          { parentId: TAB_ID, builtInSectionKey: null },
        ],
        isBuiltInSectionAvailable,
      }),
    ).toBe(false);
    expect(
      isNavigationMenuTabWithOnlyUnavailableSections({
        tabId: TAB_ID,
        navigationMenuItems: [],
        isBuiltInSectionAvailable,
      }),
    ).toBe(false);
  });
});
