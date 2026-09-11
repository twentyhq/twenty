import {
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchLayoutCustomizationAvailability =
  (isLayoutCustomizationAllowedOnCurrentPage: boolean) =>
  (item: CommandMenuItemFieldsFragment) =>
    item.engineComponentKey !== EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT ||
    isLayoutCustomizationAllowedOnCurrentPage;
