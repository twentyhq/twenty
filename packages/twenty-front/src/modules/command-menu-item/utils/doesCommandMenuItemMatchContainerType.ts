import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

// Record field items render next to their field, never in menus or headers.
export const doesCommandMenuItemMatchContainerType =
  (containerType: CommandMenuItemContainerType) =>
  (item: CommandMenuItemFieldsFragment) =>
    (item.availabilityType === CommandMenuItemAvailabilityType.RECORD_FIELD) ===
    (containerType === CommandMenuItemContainerType.RecordField);
