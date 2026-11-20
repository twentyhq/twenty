import { getNavigationMenuTabIdsWithChatSections } from '@/navigation-menu-item/display/utils/getNavigationMenuTabIdsWithChatSections';

describe('getNavigationMenuTabIdsWithChatSections', () => {
  it('keeps the tabs that hold a chat section', () => {
    expect(
      getNavigationMenuTabIdsWithChatSections([
        { parentId: 'chats-tab', builtInSectionKey: 'aiChatChannels' },
        { parentId: 'sales-tab', builtInSectionKey: 'favorites' },
        { parentId: 'sales-tab', builtInSectionKey: null },
        { parentId: null, builtInSectionKey: 'aiChatRecents' },
      ]),
    ).toEqual(new Set(['chats-tab']));
  });
});
