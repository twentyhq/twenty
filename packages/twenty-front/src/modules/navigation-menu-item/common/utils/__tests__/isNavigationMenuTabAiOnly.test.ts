import { isNavigationMenuTabAiOnly } from '@/navigation-menu-item/common/utils/isNavigationMenuTabAiOnly';

const TAB_ID = 'tab-id';

describe('isNavigationMenuTabAiOnly', () => {
  it('is true when every child of the tab is an AI built-in section', () => {
    expect(
      isNavigationMenuTabAiOnly({
        tabId: TAB_ID,
        navigationMenuItems: [
          { parentId: TAB_ID, builtInSectionKey: 'aiChatChannels' },
          { parentId: TAB_ID, builtInSectionKey: 'aiChatRecents' },
          { parentId: null, builtInSectionKey: 'favorites' },
        ],
      }),
    ).toBe(true);
  });

  it('is false when the tab also holds a non-AI child', () => {
    expect(
      isNavigationMenuTabAiOnly({
        tabId: TAB_ID,
        navigationMenuItems: [
          { parentId: TAB_ID, builtInSectionKey: 'aiChatChannels' },
          { parentId: TAB_ID, builtInSectionKey: 'favorites' },
        ],
      }),
    ).toBe(false);
  });

  it('is false when the tab holds a custom section or an item', () => {
    expect(
      isNavigationMenuTabAiOnly({
        tabId: TAB_ID,
        navigationMenuItems: [
          { parentId: TAB_ID, builtInSectionKey: 'aiChatChannels' },
          { parentId: TAB_ID, builtInSectionKey: null },
        ],
      }),
    ).toBe(false);
  });

  it('is false for an empty tab', () => {
    expect(
      isNavigationMenuTabAiOnly({ tabId: TAB_ID, navigationMenuItems: [] }),
    ).toBe(false);
  });
});
