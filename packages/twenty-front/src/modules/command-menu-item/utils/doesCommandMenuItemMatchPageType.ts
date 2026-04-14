import { CommandMenuContextApiPageType } from 'twenty-shared/types';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const PAGE_TYPES_WITH_GLOBAL_OBJECT_CONTEXT = new Set([
  CommandMenuContextApiPageType.INDEX_PAGE,
  CommandMenuContextApiPageType.RECORD_PAGE,
]);

export const doesCommandMenuItemMatchPageType =
  (pageType: CommandMenuContextApiPageType) =>
  (item: CommandMenuItemFieldsFragment) =>
    item.availabilityType !==
      CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT ||
    PAGE_TYPES_WITH_GLOBAL_OBJECT_CONTEXT.has(pageType);
