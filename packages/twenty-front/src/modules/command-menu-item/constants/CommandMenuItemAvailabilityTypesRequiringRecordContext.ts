import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const COMMAND_MENU_ITEM_AVAILABILITY_TYPES_REQUIRING_RECORD_CONTEXT =
  new Set([
    CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    CommandMenuItemAvailabilityType.RECORD_SELECTION,
  ]);
