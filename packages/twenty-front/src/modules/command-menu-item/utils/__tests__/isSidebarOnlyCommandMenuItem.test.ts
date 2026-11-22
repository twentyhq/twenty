import { isSidebarOnlyCommandMenuItem } from '@/command-menu-item/utils/isSidebarOnlyCommandMenuItem';
import { EngineComponentKey } from '~/generated-metadata/graphql';

describe('isSidebarOnlyCommandMenuItem', () => {
  it('should flag the command that opens the command menu', () => {
    expect(
      isSidebarOnlyCommandMenuItem({
        engineComponentKey: EngineComponentKey.OPEN_COMMAND_MENU,
      }),
    ).toBe(true);
  });

  it('should keep every other command in command menus', () => {
    expect(
      isSidebarOnlyCommandMenuItem({
        engineComponentKey: EngineComponentKey.SEARCH_RECORDS,
      }),
    ).toBe(false);
  });
});
