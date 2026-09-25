import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const AVAILABILITY_TYPES_REQUIRING_SELECTED_RECORDS = new Set([
  CommandMenuItemAvailabilityType.RECORD_SELECTION,
  CommandMenuItemAvailabilityType.RECORD_FIELD,
]);

export const doesCommandMenuItemMatchSelectionState =
  (hasSelectedRecords: boolean) => (item: CommandMenuItemFieldsFragment) =>
    !AVAILABILITY_TYPES_REQUIRING_SELECTED_RECORDS.has(item.availabilityType) ||
    hasSelectedRecords;
