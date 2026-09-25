import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { doesCommandMenuItemMatchContainerType } from '@/command-menu-item/utils/doesCommandMenuItemMatchContainerType';
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

describe('doesCommandMenuItemMatchContainerType', () => {
  it('should keep record field items out of menus and headers', () => {
    const item = buildCommandMenuItem(
      CommandMenuItemAvailabilityType.RECORD_FIELD,
    );

    expect(
      doesCommandMenuItemMatchContainerType(
        CommandMenuItemContainerType.ShowPageHeader,
      )(item),
    ).toBe(false);
    expect(
      doesCommandMenuItemMatchContainerType(
        CommandMenuItemContainerType.RecordField,
      )(item),
    ).toBe(true);
  });

  it('should keep other items out of record fields', () => {
    const item = buildCommandMenuItem(
      CommandMenuItemAvailabilityType.RECORD_SELECTION,
    );

    expect(
      doesCommandMenuItemMatchContainerType(
        CommandMenuItemContainerType.ShowPageHeader,
      )(item),
    ).toBe(true);
    expect(
      doesCommandMenuItemMatchContainerType(
        CommandMenuItemContainerType.RecordField,
      )(item),
    ).toBe(false);
  });
});
