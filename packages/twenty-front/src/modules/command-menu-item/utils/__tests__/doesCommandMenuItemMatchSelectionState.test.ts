import { doesCommandMenuItemMatchSelectionState } from '@/command-menu-item/utils/doesCommandMenuItemMatchSelectionState';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const buildCommandMenuItem = (
  availabilityType: CommandMenuItemAvailabilityType,
) =>
  ({
    availabilityType,
  }) as CommandMenuItemFieldsFragment;

describe('doesCommandMenuItemMatchSelectionState', () => {
  it('should keep a non-record-selection item when no records are selected', () => {
    const item = buildCommandMenuItem(CommandMenuItemAvailabilityType.GLOBAL);

    expect(doesCommandMenuItemMatchSelectionState(false)(item)).toBe(true);
  });

  it('should hide a record-selection item when no records are selected', () => {
    const item = buildCommandMenuItem(
      CommandMenuItemAvailabilityType.RECORD_SELECTION,
    );

    expect(doesCommandMenuItemMatchSelectionState(false)(item)).toBe(false);
  });

  it('should keep a record-selection item when records are selected', () => {
    const item = buildCommandMenuItem(
      CommandMenuItemAvailabilityType.RECORD_SELECTION,
    );

    expect(doesCommandMenuItemMatchSelectionState(true)(item)).toBe(true);
  });
});
