import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const COMMAND_MENU_ITEM_SECTION_BY_AVAILABILITY_TYPE = {
  [CommandMenuItemAvailabilityType.RECORD_SELECTION]: 'SELECTION',
  [CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT]: 'THIS_VIEW',
  [CommandMenuItemAvailabilityType.FALLBACK]: 'FALLBACK',
  [CommandMenuItemAvailabilityType.GLOBAL]: 'WORKSPACE',
  [CommandMenuItemAvailabilityType.RECORD_FIELD]: 'SELECTION',
} as const satisfies Record<
  CommandMenuItemAvailabilityType,
  CommandMenuItemSection
>;
