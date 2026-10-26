import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const isCommandMenuItemPinnableToNavigationMenu = (
  commandMenuItem: Pick<
    CommandMenuItemFieldsFragment,
    'availabilityType' | 'engineComponentKey'
  >,
) =>
  commandMenuItem.availabilityType === CommandMenuItemAvailabilityType.GLOBAL &&
  commandMenuItem.engineComponentKey !==
    EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT;
