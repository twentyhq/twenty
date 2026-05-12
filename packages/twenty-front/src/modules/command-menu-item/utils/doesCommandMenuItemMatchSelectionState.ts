import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchSelectionState =
  (hasSelectedRecords: boolean) => (item: CommandMenuItemFieldsFragment) =>
    item.availabilityType !==
      CommandMenuItemAvailabilityType.RECORD_SELECTION || hasSelectedRecords;
