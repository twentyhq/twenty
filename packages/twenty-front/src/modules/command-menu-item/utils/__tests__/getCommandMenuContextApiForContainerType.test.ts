import { type CommandMenuContextApi } from 'twenty-shared/types';

import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { getCommandMenuContextApiForContainerType } from '@/command-menu-item/utils/getCommandMenuContextApiForContainerType';

const COMMAND_MENU_CONTEXT_API = {
  isInSidePanel: true,
  numberOfSelectedRecords: 2,
} as unknown as CommandMenuContextApi;

describe('getCommandMenuContextApiForContainerType', () => {
  it('reports the command menu list as not being a panel-hosted page', () => {
    expect(
      getCommandMenuContextApiForContainerType({
        commandMenuContextApi: COMMAND_MENU_CONTEXT_API,
        containerType: CommandMenuItemContainerType.CommandMenuList,
      }),
    ).toEqual({ ...COMMAND_MENU_CONTEXT_API, isInSidePanel: false });
  });

  it.each([
    CommandMenuItemContainerType.IndexPageHeader,
    CommandMenuItemContainerType.ShowPageHeader,
    CommandMenuItemContainerType.SidePanelFooter,
  ])('leaves %s alone', (containerType) => {
    expect(
      getCommandMenuContextApiForContainerType({
        commandMenuContextApi: COMMAND_MENU_CONTEXT_API,
        containerType,
      }),
    ).toEqual(COMMAND_MENU_CONTEXT_API);
  });
});
