import { doesCommandMenuItemMatchObjectContext } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectContext';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

const buildCommandMenuItem = ({
  availabilityType,
  availabilityCoreObjectName = null,
}: {
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityCoreObjectName?: 'workflow' | null;
}) => ({ availabilityType, availabilityCoreObjectName });

describe('doesCommandMenuItemMatchObjectContext', () => {
  it('should hide an object command on a page without an object', () => {
    const item = buildCommandMenuItem({
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    });

    expect(doesCommandMenuItemMatchObjectContext(undefined)(item)).toBe(false);
  });

  it('should keep an object command on a page with an object', () => {
    const item = buildCommandMenuItem({
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    });

    expect(doesCommandMenuItemMatchObjectContext('company-object')(item)).toBe(
      true,
    );
  });

  it('should keep a global command on a page without an object', () => {
    const item = buildCommandMenuItem({
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    });

    expect(doesCommandMenuItemMatchObjectContext(undefined)(item)).toBe(true);
  });

  it('should keep a core object command on a page without an object', () => {
    const item = buildCommandMenuItem({
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
      availabilityCoreObjectName: 'workflow',
    });

    expect(doesCommandMenuItemMatchObjectContext(undefined)(item)).toBe(true);
  });
});
