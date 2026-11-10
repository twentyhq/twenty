import { doesCommandMenuItemMatchObjectContext } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectContext';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

const buildCommandMenuItem = (
  availabilityType: CommandMenuItemAvailabilityType,
) => ({ availabilityType });

describe('doesCommandMenuItemMatchObjectContext', () => {
  it('should hide an object command on a page without an object', () => {
    const item = buildCommandMenuItem(
      CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    );

    expect(doesCommandMenuItemMatchObjectContext(undefined)(item)).toBe(false);
  });

  it('should keep an object command on a page with an object', () => {
    const item = buildCommandMenuItem(
      CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    );

    expect(doesCommandMenuItemMatchObjectContext('company-object')(item)).toBe(
      true,
    );
  });

  it('should keep a global command on a page without an object', () => {
    const item = buildCommandMenuItem(CommandMenuItemAvailabilityType.GLOBAL);

    expect(doesCommandMenuItemMatchObjectContext(undefined)(item)).toBe(true);
  });
});
