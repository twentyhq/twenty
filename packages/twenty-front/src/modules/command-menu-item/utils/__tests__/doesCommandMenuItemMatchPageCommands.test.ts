import { doesCommandMenuItemMatchPageCommands } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageCommands';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const buildCommandMenuItem = (engineComponentKey: EngineComponentKey) =>
  ({
    engineComponentKey,
  }) as CommandMenuItemFieldsFragment;

describe('doesCommandMenuItemMatchPageCommands', () => {
  it('should keep a page command the current page registered', () => {
    const item = buildCommandMenuItem(EngineComponentKey.SAVE_PAGE);

    expect(
      doesCommandMenuItemMatchPageCommands([EngineComponentKey.SAVE_PAGE])(
        item,
      ),
    ).toBe(true);
  });

  it('should hide a page command the current page did not register', () => {
    const item = buildCommandMenuItem(EngineComponentKey.SAVE_PAGE);

    expect(
      doesCommandMenuItemMatchPageCommands([EngineComponentKey.CANCEL_PAGE])(
        item,
      ),
    ).toBe(false);
  });

  it('should keep a command that is not a page command on any page', () => {
    const item = buildCommandMenuItem(EngineComponentKey.CREATE_NEW_RECORD);

    expect(doesCommandMenuItemMatchPageCommands([])(item)).toBe(true);
  });
});
